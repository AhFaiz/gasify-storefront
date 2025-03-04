
import React, { useState } from 'react';
import { X, Package, User, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    alamat: '',
    email: '',
    quantity: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + amount) // Ensure quantity is at least 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const customerId = `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const totalPrice = Number(product.price) * formData.quantity;
      
      // Create customer directly without checking for existing one
      // This avoids the infinite recursion issue with admin policies
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .insert({
          id: customerId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          alamat: formData.alamat
        })
        .select('id')
        .single();
      
      if (customerError) {
        console.error('Error creating customer:', customerError.message);
        toast.error('Failed to create customer profile');
        setIsSubmitting(false);
        return;
      }
      
      // Create order record
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_id: customerData.id,
          total: totalPrice,
          payment_method: 'cash', // Default to cash
          status: 'pending',
          produk: product.name,
          jumlah: formData.quantity,
          tanggal: new Date().toISOString()
        });

      if (orderError) {
        console.error('Order creation error:', orderError);
        toast.error('Failed to create order: ' + orderError.message);
        setIsSubmitting(false);
        return;
      }

      console.log('Order completed successfully');
      setOrderSuccess(true);
      toast.success('Pesanan berhasil dibuat!');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setOrderSuccess(false);
        onClose();
        setFormData({
          name: '',
          phone: '',
          alamat: '',
          email: '',
          quantity: 1,
        });
      }, 3000);
      
    } catch (error) {
      console.error('Exception processing order:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className={cn(
          "bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto",
          "animate-scale-in"
        )}
      >
        {orderSuccess ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h2>
            <p className="mb-6 text-gray-600">Terima kasih telah melakukan pemesanan. Kami akan segera menghubungi Anda.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Form Pemesanan</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs text-primary/80 font-medium mb-1">
                    {product.category}
                  </div>
                  <h3 className="font-medium text-base">{product.name}</h3>
                  <div className="mt-1 font-display font-semibold text-lg">
                    Rp{product.price.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-medium">Jumlah:</div>
                <div className="flex items-center border rounded">
                  <button
                    type="button" 
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-1 border-r hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{formData.quantity}</span>
                  <button 
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-1 border-l hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-sm font-medium">
                <span>Total:</span>
                <span className="font-display font-semibold text-primary">
                  Rp{(product.price * formData.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
                    placeholder="Masukkan email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">No. Telepon</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary"
                    placeholder="Masukkan alamat lengkap"
                  ></textarea>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full bg-primary text-white font-medium py-2.5 px-4 rounded-md",
                    "hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isSubmitting && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send size={18} className="mr-2" />
                      <span>Kirim Pesanan</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
