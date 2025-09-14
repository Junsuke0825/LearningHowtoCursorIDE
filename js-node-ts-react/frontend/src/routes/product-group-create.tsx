import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../header';
import { fetchJSON, fetchJSONWithToken } from '../utils/util';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/store';
import { selectToken, selectLoginStatus } from '../utils/login-reducer';

const ProductGroupCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingGroups, setExistingGroups] = useState<string[]>([]);
  
  // Reduxストアから認証情報を取得
  const loginState = selectLoginStatus(useSelector((state: RootState) => state));
  const token = selectToken(useSelector((state: RootState) => state));

  // ログインしていない場合はログインページにリダイレクト
  useEffect(() => {
    if (loginState !== 'loggedIn' || !token) {
      navigate('/login');
    }
  }, [loginState, token, navigate]);

  // 既存の商品グループ一覧を取得
  useEffect(() => {
    const fetchExistingGroups = async () => {
      if (loginState !== 'loggedIn' || !token) {
        return;
      }

      try {
        const data = await fetchJSONWithToken({
          url: 'http://localhost:6600/product-groups',
          token: token
        });
        
        const groupNames = data.product_groups.map((group: any) => group.name);
        setExistingGroups(groupNames);
      } catch (err) {
        console.error('既存グループの取得に失敗しました:', err);
      }
    };

    fetchExistingGroups();
  }, [loginState, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      // 重複チェック
      if (existingGroups.includes(formData.name.trim())) {
        setError('既に該当のグループ名は登録済みです。');
        setLoading(false);
        return;
      }

      // 商品グループを作成
      const result = await fetchJSONWithToken({
        url: 'http://localhost:6600/product-groups',
        method: 'POST',
        data: formData,
        token: token
      });

      console.log('商品グループが作成されました:', result);
      
      // 成功メッセージを表示して商品グループ一覧に戻る
      alert('商品の登録が完了しました。');
      navigate('/product-groups');
      
    } catch (err: any) {
      // バックエンドからのエラーメッセージを優先的に表示
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
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
            商品グループ登録
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                グループ名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 家電製品"
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
                placeholder="商品グループの説明を入力してください"
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
                onClick={() => navigate('/product-groups')}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                商品グループ一覧画面
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductGroupCreate;
