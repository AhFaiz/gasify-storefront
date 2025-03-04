import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Eye, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, rawFetch } from '@/integrations/supabase/client';

// Update the Order interface to match exactly what's in the database
interface Order {
  id: string;
  created_at: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  product_id: string | null;
  quantity: number;
  total_price: number;
  product?: {
    name: string;
    id: string;
  };
}

// Define a type for the allowed status values for type checking in the UI
type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'New';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  // Function to check if there's any data in the orders table using direct REST API
  const checkDirectRestApi = async () => {
    try {
      console.log('Checking orders table directly through REST API...');
      const rawData = await rawFetch('/rest/v1/orders?select=*&limit=100');
      
      console.log('Direct REST API results:', {
        isArray: Array.isArray(rawData),
        count: Array.isArray(rawData) ? rawData.length : 'Not an array',
        sample: Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : 'No data'
      });
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        // If we got data directly, use it
        console.log('Successfully retrieved orders via direct REST API!');
        const ordersWithProducts = await Promise.all(
          rawData.map(async (order) => {
            if (!order.product_id) {
              return { ...order, product: null };
            }
            
            try {
              const productData = await rawFetch(`/rest/v1/products?id=eq.${order.product_id}&select=id,name`);
              return { 
                ...order, 
                product: Array.isArray(productData) && productData.length > 0 ? productData[0] : null 
              };
            } catch (err) {
              console.error('Error fetching product for order:', err);
              return { ...order, product: null };
            }
          })
        );
        
        setOrders(ordersWithProducts);
        setFetchError(null);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error in direct REST API check:', err);
      return false;
    }
  };

  // Function to check if there's any data in the orders table
  const checkOrdersTableData = async () => {
    try {
      console.log('Checking orders table data...');
      
      // First try a basic count
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Orders table count check: ${count} records found`);
      
      if (error) {
        console.error('Error checking orders count:', error);
        return false;
      } else if (count === 0) {
        console.warn('Orders table is empty. No records exist in the database.');
        return false;
      }
      
      // If count is positive, attempt to get first few records
      const { data: sampleData, error: sampleError } = await supabase
        .from('orders')
        .select('id, customer_name, status')
        .limit(3);
        
      if (sampleError) {
        console.error('Error fetching sample orders:', sampleError);
        return false;
      }
      
      console.log('Sample orders data:', sampleData);
      return count > 0;
    } catch (err) {
      console.error('Failed to check orders count:', err);
      return false;
    }
  };

  // Alternative fetch function with a simplified approach
  const fetchOrdersSimple = async () => {
    try {
      console.log('Trying simplified fetch approach...');
      
      // First, fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) {
        console.error('Simple fetch - Error fetching orders:', ordersError);
        return false;
      }

      console.log('Simple fetch - Orders data:', ordersData);
      
      if (!ordersData || ordersData.length === 0) {
        console.warn('Simple fetch - No orders found');
        return false;
      }

      // Then, for each order, fetch the associated product
      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order) => {
          if (!order.product_id) {
            return { ...order, product: null };
          }

          const { data: productData } = await supabase
            .from('products')
            .select('id, name')
            .eq('id', order.product_id)
            .single();

          return { ...order, product: productData || null };
        })
      );

      console.log('Simple fetch - Orders with products:', ordersWithProducts);
      
      if (ordersWithProducts.length > 0) {
        setOrders(ordersWithProducts);
        setFetchError(null);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error in simple fetch approach:', err);
      return false;
    }
  };

  // Function to fetch orders with enhanced approach prioritizing successful retrieval
  const fetchOrders = async () => {
    setLoading(true);
    setFetchError(null);
    setFetchAttempts(prev => prev + 1);
    
    try {
      console.log(`Fetching orders from Supabase... (Attempt ${fetchAttempts + 1})`);
      
      // Check if there's data in the table first
      const hasData = await checkOrdersTableData();
      console.log(`Order table has data: ${hasData}`);
      
      if (!hasData) {
        console.log('No data found in orders table, will try inserting test data');
        setOrders([]);
        setLoading(false);
        toast.error('Tidak ada pesanan ditemukan dalam database');
        return;
      }
      
      // Try the standard approach first - with simplified query
      console.log('Trying standard fetch approach with simplified query...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          status, 
          customer_name, 
          customer_email, 
          customer_phone, 
          customer_address, 
          product_id, 
          quantity, 
          total_price
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error in standard fetch approach:', error);
        setFetchError(`Error standar: ${error.message}`);
        
        // Try alternative approaches
        console.log('Trying alternative fetch approaches...');
        
        // Try simple fetch first
        const simpleSuccess = await fetchOrdersSimple();
        
        if (!simpleSuccess) {
          // As a last resort, try direct REST API
          const directSuccess = await checkDirectRestApi();
          
          if (!directSuccess) {
            console.error('All fetch approaches failed');
            setFetchError('Semua metode pengambilan data gagal. Mohon periksa konsol untuk detail.');
            setOrders([]);
          }
        }
        
        setLoading(false);
        return;
      }

      // Log the raw data received 
      console.log('Standard fetch raw data:', data);
      
      if (!data || data.length === 0) {
        console.log('No orders found with standard fetch, trying alternatives');
        
        // Try simple fetch
        const simpleSuccess = await fetchOrdersSimple();
        
        if (!simpleSuccess) {
          // Try direct REST API
          const directSuccess = await checkDirectRestApi();
          
          if (!directSuccess) {
            setOrders([]);
            setFetchError('Tidak ada pesanan yang ditemukan dalam database');
          }
        }
        
        setLoading(false);
        return;
      }
      
      // If we have orders but no product details, fetch them separately
      console.log(`Found ${data.length} orders, fetching product details...`);
      
      const ordersWithProducts = await Promise.all(
        data.map(async (order) => {
          if (!order.product_id) {
            return { ...order, product: null };
          }
          
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id, name')
            .eq('id', order.product_id)
            .single();
            
          if (productError) {
            console.warn(`Could not fetch product for order ${order.id}:`, productError);
            return { ...order, product: null };
          }
            
          return { ...order, product: productData };
        })
      );
      
      console.log('Processed orders with product details:', ordersWithProducts);
      setOrders(ordersWithProducts);
      setFetchError(null);
      
      if (ordersWithProducts.length > 0) {
        toast.success(`Berhasil memuat ${ordersWithProducts.length} pesanan`);
      } else {
        toast.warning('Tidak ada pesanan yang ditemukan');
      }
      
    } catch (error: any) {
      console.error('Exception fetching orders:', error);
      setFetchError(error?.message || 'Unknown error');
      toast.error('Gagal memuat pesanan');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Orders component mounted, fetching orders...');
    fetchOrders();
  }, []);

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  // Update the handleUpdateStatus to use string for status but ensure we only pass valid values
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    // Validate that the new status is one of the allowed values
    const validStatus: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'New'];
    if (!validStatus.includes(newStatus as OrderStatus)) {
      toast.error(`Invalid status: ${newStatus}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      toast.success(`Status pesanan ${orderId} diperbarui ke ${newStatus}`);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Gagal memperbarui status pesanan');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'New': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">Manajemen Pesanan</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat dan kelola pesanan pelanggan</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pesanan..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <div className="flex items-center">
            <Filter size={18} className="text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            >
              <option value="All">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Dikirim</option>
              <option value="Delivered">Selesai</option>
              <option value="Cancelled">Dibatalkan</option>
              <option value="New">New</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={fetchOrders}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={18} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          <div className="flex items-start">
            <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error saat memuat data pesanan:</p>
              <p>{fetchError}</p>
              <p className="mt-2">
                Periksa konsol browser untuk detail lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <RefreshCw size={24} className="animate-spin text-gray-400" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Memuat data pesanan...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    {fetchError ? 'Error loading orders' : 'Tidak ada pesanan yang ditemukan'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name || '-'}</div>
                      <div className="text-sm text-gray-500">{order.customer_email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.product?.name || 'Produk tidak ditemukan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rp{order.total_price?.toLocaleString('id-ID') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <Eye className="h-5 w-5 mr-1" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
              onClick={handleCloseModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detail Pesanan - {selectedOrder.id}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-700 mb-2">Informasi Pelanggan</h4>
                    <p className="text-sm mb-1"><span className="font-medium">Nama:</span> {selectedOrder.customer_name || '-'}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Email:</span> {selectedOrder.customer_email || '-'}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Telepon:</span> {selectedOrder.customer_phone || '-'}</p>
                    <p className="text-sm"><span className="font-medium">Alamat:</span> {selectedOrder.customer_address || '-'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-700 mb-2">Informasi Pesanan</h4>
                    <p className="text-sm mb-1"><span className="font-medium">ID Pesanan:</span> {selectedOrder.id}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Tanggal:</span> {formatDate(selectedOrder.created_at)}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Produk:</span> {selectedOrder.product?.name || 'Produk tidak ditemukan'}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Jumlah:</span> {selectedOrder.quantity || '-'}</p>
                    <p className="text-sm mb-1"><span className="font-medium">Total:</span> Rp{selectedOrder.total_price?.toLocaleString('id-ID') || '-'}</p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> 
                      <span 
                        className={`ml-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedOrder.status)}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Perbarui Status Pesanan</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'New'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                          ${selectedOrder.status === status 
                            ? `${getStatusBadgeClass(status)} cursor-not-allowed` 
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {selectedOrder.status === status && (
                          <Check size={14} className="mr-1" />
                        )}
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
