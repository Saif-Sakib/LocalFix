import React, { useState, useRef } from 'react';
import '../../../styles/worker/submitProof.css';

const Submit_proof = ({ isOpen, onClose, onSubmit }) => {
	const [image, setImage] = useState(null);
	const [dragActive, setDragActive] = useState(false);
	const [comment, setComment] = useState("");
	const [fadeOut, setFadeOut] = useState(false);
	const fileInputRef = useRef(null);

	// Handle fade-out before unmount
	const handleClose = () => {
		setFadeOut(true);
		setTimeout(() => {
			setFadeOut(false);
			onClose();
		}, 300);
	};

	if (!isOpen && !fadeOut) return null;

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith('image/')) {
			const url = URL.createObjectURL(file);
			setImage(url);
			console.log('Image state:', url);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setDragActive(true);
	};
	const handleDragLeave = (e) => {
		e.preventDefault();
		setDragActive(false);
	};
	const handleDrop = (e) => {
		e.preventDefault();
		setDragActive(false);
		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith('image/')) {
			const url = URL.createObjectURL(file);
			setImage(url);
			console.log('Image state:', url);
		}
	};

	return (
		<div className="modal-overlay">
			<div className={`modal-content${fadeOut ? ' fade-out' : ''}`}>
				<h2>Submit Proof</h2>
				<form onSubmit={onSubmit}>
					<label>Upload Image Proof:</label>
					<div
						className={`image-drop-zone${dragActive ? ' drag-active' : ''}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current.click()}
						style={{ cursor: 'pointer', marginBottom: '1.5rem' }}
					>
						{image ? (
							<>
								<img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px' }} />
								<button
									type="button"
									className="remove-image-btn"
									onClick={e => { e.stopPropagation(); setImage(null); }}
									style={{ marginTop: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 1.2rem', fontWeight: 500, cursor: 'pointer', fontSize: '0.95rem' }}
								>
									Remove Image
								</button>
							</>
						) : (
							<span style={{ color: '#64748b' }}>
								Drag & drop an image here, or click to select
							</span>
						)}
						<input
							type="file"
							accept="image/*"
							ref={fileInputRef}
							style={{ display: 'none' }}
							onChange={handleImageChange}
						/>
					</div>

					<label htmlFor="comment">Comment (optional):</label>
					<textarea
						id="comment"
						name="comment"
						rows={3}
						placeholder="Add any comments..."
						style={{width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', resize: 'vertical', fontSize: '1rem', background: '#f1f5f9'}}
						value={comment}
						onChange={e => setComment(e.target.value)}
					/>

					<div className="modal-actions">
						<button type="submit">Submit</button>
						<button type="button" onClick={handleClose}>Cancel</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Submit_proof;