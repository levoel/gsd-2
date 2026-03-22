import type { AutocompleteProvider } from "./autocomplete.js";
import type { Component } from "./tui.js";

/** Lightweight image attachment stored in the editor. */
export interface EditorImageAttachment {
	/** base64-encoded image data */
	data: string;
	/** MIME type, e.g. "image/png" */
	mimeType: string;
	/** Human-readable size label, e.g. "142KB" */
	sizeLabel: string;
}

/**
 * Interface for custom editor components.
 *
 * This allows extensions to provide their own editor implementation
 * (e.g., vim mode, emacs mode, custom keybindings) while maintaining
 * compatibility with the core application.
 */
export interface EditorComponent extends Component {
	// =========================================================================
	// Core text access (required)
	// =========================================================================

	/** Get the current text content */
	getText(): string;

	/** Set the text content */
	setText(text: string): void;

	/** Handle raw terminal input (key presses, paste sequences, etc.) */
	handleInput(data: string): void;

	// =========================================================================
	// Callbacks (required)
	// =========================================================================

	/** Called when user submits (e.g., Enter key). Images are attached clipboard images, if any. */
	onSubmit?: (text: string, images?: EditorImageAttachment[]) => void;

	/** Called when text changes */
	onChange?: (text: string) => void;

	// =========================================================================
	// History support (optional)
	// =========================================================================

	/** Add text to history for up/down navigation */
	addToHistory?(text: string): void;

	// =========================================================================
	// Advanced text manipulation (optional)
	// =========================================================================

	/** Insert text at current cursor position */
	insertTextAtCursor?(text: string): void;

	/**
	 * Get text with any markers expanded (e.g., paste markers).
	 * Falls back to getText() if not implemented.
	 */
	getExpandedText?(): string;

	// =========================================================================
	// Autocomplete support (optional)
	// =========================================================================

	/** Set the autocomplete provider */
	setAutocompleteProvider?(provider: AutocompleteProvider): void;

	// =========================================================================
	// Appearance (optional)
	// =========================================================================

	/** Border color function */
	borderColor?: (str: string) => string;

	/** Set horizontal padding */
	setPaddingX?(padding: number): void;

	/** Set max visible items in autocomplete dropdown */
	setAutocompleteMaxVisible?(maxVisible: number): void;

	// =========================================================================
	// Image attachments (optional)
	// =========================================================================

	/** Add an image attachment. Returns the index of the added image. */
	addImageAttachment?(image: EditorImageAttachment): number;

	/** Remove an image attachment by index. */
	removeImageAttachment?(index: number): void;

	/** Get all image attachments and clear them (for submit). */
	takeImageAttachments?(): EditorImageAttachment[];

	/** Get current image attachments (read-only peek). */
	getImageAttachments?(): readonly EditorImageAttachment[];
}
