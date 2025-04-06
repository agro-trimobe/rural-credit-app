'use client'

import { useState, useCallback } from 'react'
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  FileEdit,
  CheckSquare
} from 'lucide-react'
import { Visita } from '@/lib/crm-utils'
import { formatarData } from '@/lib/formatters'
import Link from 'next/link'

// Importar os estilos do calendário
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/styles/calendar.css'

// Configurar o localizador para português
const locales = {
  'pt-BR': ptBR,
}

// Criar localizador usando o date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
})

// Mensagens em português para o calendário
const messages = {
  today: 'Hoje',
  previous: 'Anterior',
  next: 'Próximo',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Dia inteiro',
  noEventsInRange: 'Não há visitas neste período',
}

// Interface para os eventos do calendário
interface EventoCalendario {
  id: string
  title: string
  start: Date
  end: Date
  status: 'Agendada' | 'Realizada' | 'Cancelada'
  atrasada: boolean
  cliente: string
  observacoes?: string
  allDay: boolean
}

interface CalendarioVisitasProps {
  visitas: Visita[]
  clientesMap: {[key: string]: string}
}

export function CalendarioVisitas({ visitas, clientesMap }: CalendarioVisitasProps) {
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())

  // Verificar se a visita está atrasada (data no passado e status ainda é Agendada)
  const isVisitaAtrasada = (visita: Visita) => {
    return visita.status === 'Agendada' && new Date(visita.data) < new Date()
  }

  // Converter visitas para o formato de eventos do calendário
  const eventos: EventoCalendario[] = visitas.map(visita => {
    const dataVisita = new Date(visita.data)
    
    // Criar data de fim (para eventos de dia inteiro)
    const dataFim = new Date(dataVisita)
    dataFim.setHours(dataFim.getHours() + 2) // Duração padrão de 2 horas
    
    return {
      id: visita.id,
      title: `${clientesMap[visita.clienteId] || 'Cliente não encontrado'}`,
      start: dataVisita,
      end: dataFim,
      status: visita.status,
      atrasada: isVisitaAtrasada(visita),
      cliente: clientesMap[visita.clienteId] || 'Cliente não encontrado',
      observacoes: visita.observacoes,
      allDay: false,
    }
  })

  // Estilizar eventos com base no status
  const eventStyleGetter = (event: EventoCalendario) => {
    let className = `rbc-event ${event.status.toLowerCase()}`
    
    if (event.atrasada) {
      className = 'rbc-event atrasada'
    }
    
    return {
      className,
    }
  }

  // Componente para renderizar o evento no calendário
  const EventComponent = ({ event }: { event: EventoCalendario }) => (
    <div>
      <div className="font-medium">{event.title}</div>
      <div className="text-xs">{event.status}</div>
    </div>
  )

  // Componente para renderizar o tooltip do evento
  const EventAgendaComponent = ({ event }: { event: EventoCalendario }) => (
    <div className="p-2">
      <div className="font-medium">{event.title}</div>
      <div className="text-xs flex items-center gap-2">
        <Badge className={`${event.status.toLowerCase()}`}>
          {event.status}
        </Badge>
        {event.atrasada && (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
            Atrasada
          </Badge>
        )}
      </div>
      {event.observacoes && (
        <div className="text-xs mt-1 text-muted-foreground">{event.observacoes}</div>
      )}
      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="outline" asChild className="h-7 text-xs">
          <Link href={`/visitas/${event.id}`}>
            <Eye className="h-3 w-3 mr-1" /> Ver
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild className="h-7 text-xs">
          <Link href={`/visitas/${event.id}/editar`}>
            <FileEdit className="h-3 w-3 mr-1" /> Editar
          </Link>
        </Button>
        {event.status === 'Agendada' && (
          <Button size="sm" variant="outline" asChild className="h-7 text-xs">
            <Link href={`/visitas/${event.id}/registrar`}>
              <CheckSquare className="h-3 w-3 mr-1" /> Registrar
            </Link>
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <Calendar
          localizer={localizer as any}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 580 }}
          views={['month', 'week', 'day', 'agenda']}
          defaultView={Views.MONTH}
          view={view as any}
          date={date}
          onView={(view) => setView(view)}
          onNavigate={(date) => setDate(date)}
          messages={messages}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
            agenda: {
              event: EventAgendaComponent,
            },
          }}
          popup
          formats={{
            dateFormat: 'dd',
            dayFormat: 'ddd dd/MM',
            monthHeaderFormat: 'MMMM yyyy',
            dayHeaderFormat: 'dddd, dd/MM/yyyy',
            dayRangeHeaderFormat: ({ start, end }) => 
              `${formatarData(start.toString())} - ${formatarData(end.toString())}`,
          }}
        />
      </CardContent>
    </Card>
  )
}
