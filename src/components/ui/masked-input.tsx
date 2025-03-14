'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: 'data' | 'datahora'
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value.replace(/\D/g, '')
      let formattedValue = ''

      if (mask === 'data') {
        // Formato: DD/MM/YYYY
        if (inputValue.length > 0) {
          formattedValue = inputValue.substring(0, 2)
        }
        if (inputValue.length > 2) {
          formattedValue += '/' + inputValue.substring(2, 4)
        }
        if (inputValue.length > 4) {
          formattedValue += '/' + inputValue.substring(4, 8)
        }
      } else if (mask === 'datahora') {
        // Formato: DD/MM/YYYY HH:MM
        if (inputValue.length > 0) {
          formattedValue = inputValue.substring(0, 2)
        }
        if (inputValue.length > 2) {
          formattedValue += '/' + inputValue.substring(2, 4)
        }
        if (inputValue.length > 4) {
          formattedValue += '/' + inputValue.substring(4, 8)
        }
        if (inputValue.length > 8) {
          formattedValue += ' ' + inputValue.substring(8, 10)
        }
        if (inputValue.length > 10) {
          formattedValue += ':' + inputValue.substring(10, 12)
        }
      }

      // Criar um novo evento com o valor formatado
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue
        }
      }

      // Chamar o onChange original com o novo evento
      if (onChange) {
        onChange(newEvent as React.ChangeEvent<HTMLInputElement>)
      }
    }

    // Função para validar a entrada de dados
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Permitir apenas números, teclas de navegação e de edição
      if (!/[\d]/.test(e.key) && 
          e.key !== 'Backspace' && 
          e.key !== 'Delete' && 
          e.key !== 'ArrowLeft' && 
          e.key !== 'ArrowRight' && 
          e.key !== 'Tab') {
        e.preventDefault()
      }
    }

    // Função para converter valor ISO para formato de exibição
    const formatValueForDisplay = (isoValue: string | number | readonly string[] | undefined) => {
      if (!isoValue || typeof isoValue !== 'string' || isoValue === '') return ''
      
      try {
        const date = new Date(isoValue)
        if (isNaN(date.getTime())) return isoValue as string
        
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        
        if (mask === 'data') {
          return `${day}/${month}/${year}`
        } else {
          const hours = date.getHours().toString().padStart(2, '0')
          const minutes = date.getMinutes().toString().padStart(2, '0')
          return `${day}/${month}/${year} ${hours}:${minutes}`
        }
      } catch (error) {
        return isoValue as string
      }
    }

    // Formatar o valor para exibição se for uma data ISO
    const displayValue = typeof value === 'string' && (value.includes('T') || value.includes('-')) 
      ? formatValueForDisplay(value) 
      : value

    return (
      <Input
        className={cn(className)}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder={mask === 'data' ? 'DD/MM/AAAA' : 'DD/MM/AAAA HH:MM'}
        {...props}
      />
    )
  }
)

MaskedInput.displayName = "MaskedInput"

export { MaskedInput }
