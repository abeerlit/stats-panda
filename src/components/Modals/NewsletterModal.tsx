/* eslint-disable */

import React, { useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import Modal from '@mui/material/Modal';
import './StatsPandaModal.css';

const NewsletterModal = ({ isOpen, setIsOpen }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return (
      email.length <= 254 &&
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    );
  };

  const createEmailId = (email: string) => {
    // Use btoa for base64 encoding in the browser
    return btoa(email.toLowerCase()).replace(/[/+=]/g, '_');
  };

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
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      const normalizedEmail = email.toLowerCase();
      const emailId = createEmailId(normalizedEmail);
      const emailDoc = doc(db, 'emails', emailId);

      // Check if email exists with single read
      const docSnap = await getDoc(emailDoc);
      if (docSnap.exists()) {
        throw new Error('This email is already subscribed');
      }

      // Add new email
      await setDoc(emailDoc, {
        email: normalizedEmail,
        timestamp: serverTimestamp(),
        clientInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      closeModal();
      // Optional: Add success notification here
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Subscription failed. Please try again.',
      );
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
        <h2 className="modal-title">Join Our Newsletter!</h2>
        <p className="modal-subtitle">
          Be a part of 54,000+ people in receiving exclusive insights, reports,
          data, and more.
        </p>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email address"
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
            {loading ? 'Subscribing...' : 'SUBSCRIBE NOW'}
          </button>
        </form>
        <p className="modal-error-text">{error}</p>
        <p className="modal-footer-text">
          By subscribing, you will receive our weekly newsletter and agree to
          our {/* <a className="modal-link"> */}
          Terms & Conditions
          {/* </a>{" "} */}
          and
          {/* <a className="modal-link"> */}
          Privacy Policy
          {/* </a> */}. You can unsubscribe anytime.
        </p>
      </div>
    </Modal>
  );
};

export default NewsletterModal;
