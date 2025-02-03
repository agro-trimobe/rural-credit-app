import { getStatusLabel, getStatusIcon } from '@/lib/project-status';
import { Timer, CheckCircle2, AlertOctagon, FileText, Search, HelpCircle } from 'lucide-react';

const icons = {
  Timer,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Search,
  HelpCircle,
};

interface ProjectStatusProps {
  status: string;
}

export function ProjectStatus({ status }: ProjectStatusProps) {
  const { icon: IconName, color } = getStatusIcon(status);
  const Icon = icons[IconName as keyof typeof icons];
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span>{getStatusLabel(status)}</span>
    </div>
  );
}
