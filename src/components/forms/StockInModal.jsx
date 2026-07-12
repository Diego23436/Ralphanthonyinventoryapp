import React from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import StockInForm from './StockInForm'

export default function StockInModal({ open, onClose }) {
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose} title={t('stockIn.title')}>
      <StockInForm onSubmitted={onClose} />
    </Modal>
  )
}
