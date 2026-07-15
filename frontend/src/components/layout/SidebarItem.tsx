import { NavLink } from 'react-router-dom';
import { type IconType } from 'react-icons';

interface SidebarItemProps {
  icon: IconType;
  label: string;
  path: string;
  badge?: string;
  isCollapsed: boolean;
}

export function SidebarItem({ icon: Icon, label, path, badge, isCollapsed }: SidebarItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
          isActive
            ? 'bg-brand text-white shadow-lg shadow-brand/20'
            : 'text-text-secondary hover:bg-surface-hover'
        }`
      }
    >
      <Icon size={20} className="shrink-0" />
      
      {!isCollapsed && (
        <>
          <span className="text-sm font-medium flex-1">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}