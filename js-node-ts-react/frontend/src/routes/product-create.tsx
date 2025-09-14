import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import { fetchJSON, fetchJSONWithToken } from '../utils/util';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/store';
import { selectToken, selectLoginStatus } from '../utils/login-reducer';

interface ProductGroup {
  id: number;
  name: string;
  description: string;
}

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [formData, setFormData] = useState({
    product_group_id: '',
    name: '',
    description: '',
    price: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reduxストアから認証情報を取得
  const loginState = selectLoginStatus(useSelector((state: RootState) => state));
  const token = selectToken(useSelector((state: RootState) => state));

  // ログインしていない場合はログインページにリダイレクト
  useEffect(() => {
    if (loginState !== 'loggedIn' || !token) {
      navigate('/login');
    }
  }, [loginState, token, navigate]);

  // 商品グループ一覧を取得
  useEffect(() => {
    const fetchProductGroups = async () => {
      try {
        // ログイン状態をチェック
        if (loginState !== 'loggedIn' || !token) {
          return;
        }

        // 商品グループ一覧を取得
        const data = await fetchJSONWithToken({
          url: 'http://localhost:6600/product-groups',
          token: token
        });

        setProductGroups(data.product_groups);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    };

    fetchProductGroups();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ログイン状態をチェック
      if (loginState !== 'loggedIn' || !token) {
        throw new Error('ログインが必要です');
      }

      // 商品を作成
      const result = await fetchJSONWithToken({
        url: 'http://localhost:6600/products',
        method: 'POST',
        data: {
          product_group_id: parseInt(formData.product_group_id),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0
        },
        token: token
      });

      console.log('商品が作成されました:', result);
      
      // 成功メッセージを表示して商品一覧に戻る
      alert('商品が正常に作成されました！');
      navigate('/products');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ログインしていない場合は何も表示しない
  if (loginState !== 'loggedIn' || !token) {
    return null;
  }

  return (
    <div className="App">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            商品登録
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="product_group_id" className="block text-sm font-medium text-gray-700 mb-1">
                商品グループ *
              </label>
              <select
                id="product_group_id"
                name="product_group_id"
                value={formData.product_group_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {productGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                商品名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: iPhone 15"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="商品の説明を入力してください"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                価格
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                在庫数
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? '作成中...' : '作成'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCreate;
