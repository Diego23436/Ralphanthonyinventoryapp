import React from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import StockOutForm from './StockOutForm'

export default function StockOutModal({ open, onClose }) {
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onClose} title={t('stockOut.title')}>
      <StockOutForm onSubmitted={onClose} />
    </Modal>
  )
}
