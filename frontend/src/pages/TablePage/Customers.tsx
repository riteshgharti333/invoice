import { TbPlus, TbEye, TbEdit, TbDotsVertical, TbMail, TbPhone } from 'react-icons/tb';
import type { Customer } from '../../types';
import { formatDate } from '../../libs/utils';
import { ActiveBadge } from '../../components/ui/ActiveBadge';
import { Table } from '../../components/ui/Table';
import {Link} from "react-router-dom"

const customers: Customer[] = [
  {
    id: '1',
    customerCode: 'CUST-001',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    phone: '+91 98765 43210',
    address: '123, Business Park, Mumbai - 400001',
    gstNumber: '27AABCT1234C1Z5',
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-10-20',
  },
  {
    id: '2',
    customerCode: 'CUST-002',
    name: 'Globex Inc',
    email: 'accounts@globex.com',
    phone: '+91 87654 32109',
    address: '456, Tech Hub, Bangalore - 560001',
    gstNumber: '29AABCT5678C1Z9',
    isActive: true,
    createdAt: '2024-03-10',
    updatedAt: '2024-10-18',
  },
  {
    id: '3',
    customerCode: 'CUST-003',
    name: 'Initech Ltd',
    email: null,
    phone: '+91 76543 21098',
    address: null,
    gstNumber: null,
    isActive: false,
    createdAt: '2024-05-20',
    updatedAt: '2024-09-15',
  },
  {
    id: '4',
    customerCode: 'CUST-004',
    name: 'Umbrella Corp',
    email: 'ap@umbrella.com',
    phone: '+91 65432 10987',
    address: '789, Industrial Area, Delhi - 110001',
    gstNumber: '07AABCT9012C1Z3',
    isActive: true,
    createdAt: '2024-06-01',
    updatedAt: '2024-10-22',
  },
  {
    id: '5',
    customerCode: 'CUST-005',
    name: 'Stark Industries',
    email: 'pepper@stark.com',
    phone: '+91 54321 09876',
    address: '100, Innovation Street, Hyderabad - 500001',
    gstNumber: '36AABCT3456C1Z7',
    isActive: true,
    createdAt: '2024-08-12',
    updatedAt: '2024-10-25',
  },
];

export default function Customers() {
  const columns = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (row: Customer) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{row.name}</p>
          <p className="text-xs text-text-muted mt-0.5 font-mono">{row.customerCode}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      sortable: true,
      className: 'hidden md:table-cell',
      render: (row: Customer) => (
        <div className="space-y-0.5">
          {row.email && (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <TbMail size={12} />
              <span>{row.email}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <TbPhone size={12} />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'gstNumber',
      header: 'GST Number',
      sortable: true,
      className: 'hidden lg:table-cell',
      render: (row: Customer) => (
        <span className="text-text-secondary text-xs font-mono">
          {row.gstNumber || '—'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      className: 'hidden sm:table-cell',
      render: (row: Customer) => <ActiveBadge isActive={row.isActive} />,
    },
    {
      key: 'createdAt',
      header: 'Added On',
      sortable: true,
      className: 'hidden lg:table-cell',
      render: (row: Customer) => (
        <span className="text-text-secondary text-xs">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (_row: Customer) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors">
            <TbEye size={16} className="text-text-secondary" />
          </button>
          <button className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors">
            <TbEdit size={16} className="text-text-secondary" />
          </button>
          <button className="p-1.5 hover:bg-surface-hover rounded-lg transition-colors">
            <TbDotsVertical size={16} className="text-text-secondary" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="text-text-secondary text-sm mt-1">Manage all your customers</p>
        </div>
        <Link to="/new-customer" className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-brand/25">
          <TbPlus size={18} />
          Add Customer
        </Link>
      </div>

      <Table
        columns={columns}
        data={customers}
        searchable
        searchPlaceholder="Search customers by name, email or phone..."
        onRowClick={(row) => console.log('Clicked:', row.name)}
        emptyMessage="No customers found"
      />
    </div>
  );
}