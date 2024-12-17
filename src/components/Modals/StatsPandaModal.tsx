/* eslint-disable */
import React, { useState } from 'react';
import './StatsPandaModal.css';
import Modal from '@mui/material/Modal';

const StatsPandaModal = ({ isOpen, setIsOpen }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const closeModal = () => {
    setIsOpen(false);
    setEmail('');
    setError('');
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = 'API call to subscribe user';

      if (!response?.ok) {
        throw new Error('Failed to subscribe. Please try again.');
      }

      closeModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="modal-content">
        <img
          onClick={closeModal}
          src="/assets/close.png"
          width={30}
          height={30}
          alt="Close Icon"
          className="close-modal-icon"
        />
        <img
          src="/assets/SpLogoLong.png"
          alt="StatsPanda Logo"
          className="logo"
        />
        <h2 className="modal-title">Don&apos;t Miss Out!</h2>
        <p className="modal-subtitle">
          Get exclusive data reports and insights
        </p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email address"
            className="modal-email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="modal-submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'CLAIM OFFER'}
          </button>
        </form>
        <p className="modal-error-text">{error || ' '}</p>
        <p className="modal-footer-text">
          By sharing your email address, you agree to receive marketing emails
          and consent to our{' '}
          <a href="#" className="modal-link">
            Terms & Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="modal-link">
            Privacy Policy
          </a>
          . Offer valid for first-time subscribers only.
        </p>
      </div>
    </Modal>
  );
};

export default StatsPandaModal;
