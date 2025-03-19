'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: 'data' | 'datahora'
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, onChange, value, ...props }, ref) => {
    // Referência interna para o input
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Estado para controlar o valor formatado
    const [inputValue, setInputValue] = React.useState<string>('');
    
    // Atualizar o estado quando o valor externo mudar
    React.useEffect(() => {
      if (typeof value === 'string') {
        // Se for uma data ISO, converter para formato brasileiro
        if (value.includes('T') || value.includes('-')) {
          setInputValue(formatValueForDisplay(value));
        } else {
          setInputValue(value);
        }
      } else {
        setInputValue('');
      }
    }, [value, mask]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      
      // Permitir a edição direta se o usuário estiver apagando caracteres
      if (rawValue.length < inputValue.length) {
        setInputValue(rawValue);
        
        // Chamar o onChange original com o valor atual
        if (onChange) {
          onChange(e);
        }
        return;
      }
      
      // Extrair apenas os números
      const numbersOnly = rawValue.replace(/\D/g, '');
      let formattedValue = '';
      
      if (mask === 'data') {
        // Formato: DD/MM/YYYY
        if (numbersOnly.length > 0) {
          formattedValue = numbersOnly.substring(0, 2);
        }
        if (numbersOnly.length > 2) {
          formattedValue += '/' + numbersOnly.substring(2, 4);
        }
        if (numbersOnly.length > 4) {
          formattedValue += '/' + numbersOnly.substring(4, 8);
        }
      } else if (mask === 'datahora') {
        // Formato: DD/MM/YYYY HH:MM
        if (numbersOnly.length > 0) {
          formattedValue = numbersOnly.substring(0, 2);
        }
        if (numbersOnly.length > 2) {
          formattedValue += '/' + numbersOnly.substring(2, 4);
        }
        if (numbersOnly.length > 4) {
          formattedValue += '/' + numbersOnly.substring(4, 8);
        }
        if (numbersOnly.length > 8) {
          formattedValue += ' ' + numbersOnly.substring(8, 10);
        }
        if (numbersOnly.length > 10) {
          formattedValue += ':' + numbersOnly.substring(10, 12);
        }
      }
      
      // Atualizar o estado interno
      setInputValue(formattedValue);
      
      // Criar um novo evento com o valor formatado
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue
        }
      };
      
      // Chamar o onChange original com o novo evento
      if (onChange) {
        onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    // Função para converter valor ISO para formato de exibição
    const formatValueForDisplay = (isoValue: string | number | readonly string[] | undefined) => {
      if (!isoValue || typeof isoValue !== 'string' || isoValue === '') return '';
      
      try {
        // Verificar se é uma data no formato ISO
        if (!isoValue.includes('T') && !isoValue.includes('-')) {
          // Se já estiver no formato brasileiro, retornar como está
          return isoValue;
        }
        
        const date = new Date(isoValue);
        if (isNaN(date.getTime())) {
          console.error('Data inválida no MaskedInput:', isoValue);
          return '';
        }
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        if (mask === 'data') {
          return `${day}/${month}/${year}`;
        } else {
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
      } catch (error) {
        console.error('Erro ao formatar data no MaskedInput:', error);
        return '';
      }
    };

    // Combinar a ref passada pelo usuário com a ref interna
    const combinedRef = React.useMemo(() => {
      return (node: HTMLInputElement) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      };
    }, [ref]);

    return (
      <Input
        className={cn(className)}
        ref={combinedRef}
        value={inputValue}
        onChange={handleChange}
        placeholder={mask === 'data' ? 'DD/MM/AAAA' : 'DD/MM/AAAA HH:MM'}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput };
