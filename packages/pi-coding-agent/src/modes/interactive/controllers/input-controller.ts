import type { ImageContent } from "@gsd/pi-ai";
import type { EditorImageAttachment } from "@gsd/pi-tui";
import { dispatchSlashCommand } from "../slash-command-handlers.js";
import type { InteractiveModeStateHost } from "../interactive-mode-state.js";

/**
 * Convert EditorImageAttachments to ImageContent for the agent API.
 */
function toImageContent(attachments: EditorImageAttachment[]): ImageContent[] | undefined {
	if (attachments.length === 0) return undefined;
	return attachments.map((a) => ({
		type: "image" as const,
		data: a.data,
		mimeType: a.mimeType,
	}));
}

/**
 * Strip image marker text (📎 image.xxx (xxxKB)) from prompt text
 * so the LLM only sees the actual user message.
 */
function stripImageMarkers(text: string): string {
	return text.replace(/📎\s*image\.\w+\s*\(\d+(?:\.\d+)?[KMG]B\)/g, "").trim();
}

export function setupEditorSubmitHandler(host: InteractiveModeStateHost & {
	getSlashCommandContext: () => any;
	handleBashCommand: (command: string, excludeFromContext?: boolean) => Promise<void>;
	showWarning: (message: string) => void;
	showError: (message: string) => void;
	updateEditorBorderColor: () => void;
	isExtensionCommand: (text: string) => boolean;
	queueCompactionMessage: (text: string, mode: "steer" | "followUp") => void;
	updatePendingMessagesDisplay: () => void;
	flushPendingBashComponents: () => void;
	options?: { submitPromptsDirectly?: boolean };
}): void {
	host.defaultEditor.onSubmit = async (text: string, imageAttachments?: EditorImageAttachment[]) => {
		text = text.trim();
		const images = toImageContent(imageAttachments ?? []);

		// Strip image markers from text so the LLM doesn't see them
		if (images) {
			text = stripImageMarkers(text);
		}

		// Allow image-only submissions (no text required when images are attached)
		if (!text && !images) return;

		// Use a default prompt when only images are attached
		if (!text && images) {
			text = "What do you see in this image?";
		}

		if (text.startsWith("/")) {
			const handled = await dispatchSlashCommand(text, host.getSlashCommandContext());
			if (handled) {
				host.editor.setText("");
				return;
			}
		}

		if (text.startsWith("!")) {
			const isExcluded = text.startsWith("!!");
			const command = isExcluded ? text.slice(2).trim() : text.slice(1).trim();
			if (command) {
				if (host.session.isBashRunning) {
					host.showWarning("A bash command is already running. Press Esc to cancel it first.");
					host.editor.setText(text);
					return;
				}
				host.editor.addToHistory?.(text);
				await host.handleBashCommand(command, isExcluded);
				host.isBashMode = false;
				host.updateEditorBorderColor();
				return;
			}
		}

		if (host.session.isCompacting) {
			if (host.isExtensionCommand(text)) {
				host.editor.addToHistory?.(text);
				host.editor.setText("");
				await host.session.prompt(text, { images });
			} else {
				host.queueCompactionMessage(text, "steer");
			}
			return;
		}

		if (host.session.isStreaming) {
			host.editor.addToHistory?.(text);
			host.editor.setText("");
			await host.session.prompt(text, { streamingBehavior: "steer", images });
			host.updatePendingMessagesDisplay();
			host.ui.requestRender();
			return;
		}

		host.flushPendingBashComponents();

		if (host.onInputCallback) {
			host.onInputCallback(text);
			host.editor.addToHistory?.(text);
			return;
		}

		if (host.options?.submitPromptsDirectly) {
			host.editor.addToHistory?.(text);
			try {
				await host.session.prompt(text, { images });
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
				host.showError(errorMessage);
			}
			return;
		}

		host.editor.addToHistory?.(text);
	};
}
