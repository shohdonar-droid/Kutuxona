import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({children, className = ''}: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

export function StatCard({title, value, icon: Icon, color}: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-full bg-gray-50 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({children, variant = 'primary', className = '', ...props}: ButtonProps) {
  const baseClass = "px-6 py-2 rounded-lg font-medium transition flex items-center gap-2";
  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  
  return (
    <button className={`${baseClass} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
}

export function Badge({children, variant = 'gray', className = ''}: BadgeProps & {className?: string}) {
  const variants = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

export function EmptyState({title, description, icon: Icon, action}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
      {Icon && <div className="p-4 rounded-full bg-gray-50 text-gray-400 mb-4"><Icon size={48} /></div>}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
