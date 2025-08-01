import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import { useState } from 'react';
import toast from 'react-hot-toast';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe.js がロードされていません。');
      return;
    }
    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      // stripeライブラリからしかアクセスできない秘密箱のようなもの
      // この箱にユーザーの情報を詰めてstripeサーバーへ送信する
      elements,
      confirmParams: {
        // 決済完了後にユーザーがリダイレクトされるURL
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    // これより下のコードは、リダイレクトに失敗した場合や即時エラーが出た場合にのみ実行される
    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || '決済情報の入力に誤りがあります。');
      } else {
        setMessage('予期せぬエラーが発生しました。');
      }
      toast.error(`決済に失敗しました: ${message}`);
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* PaymentElement:
                カード番号、有効期限、CVC、国、郵便番号などの入力を、この一つのコンポーネントで提供してくれる
                カード情報はStripeのサーバーに直接送信されるため、クライアントアプリは一切触れることはない（セキュリティ上の対策が簡易で済む）*/}
      <PaymentElement id="payment-element" options={paymentElementOptions} />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : '支払う'}
        </span>
      </button>

      {/* エラーメッセージの表示 */}
      {message && (
        <div id="payment-message" className="mt-4 text-red-600">
          {message}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
