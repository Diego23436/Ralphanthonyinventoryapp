import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import StockInForm from '../components/forms/StockInForm'

export default function StockIn() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t('stockIn.title')}</h1>
      <div className="card p-6">
        <StockInForm onSubmitted={() => navigate('/dashboard')} />
      </div>
    </div>
  )
}
