import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import StockOutForm from '../components/forms/StockOutForm'

export default function StockOut() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{t('stockOut.title')}</h1>
      <div className="card p-6">
        <StockOutForm onSubmitted={() => navigate('/dashboard')} />
      </div>
    </div>
  )
}
