import React from "react";
import type { OrderBook } from "../types";

interface OrderBookTableProps {
  orderBook: OrderBook;
}

function formatPrice(price: number): string {
  return `${(price * 100).toFixed(1)}¢`;
}

function formatShares(shares: number): string {
  return shares.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatTotal(total: number): string {
  return `$${total.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export const OrderBookTable: React.FC<OrderBookTableProps> = ({ orderBook }) => {
  // Reverse asks so highest is at top
  const asks = [...orderBook.asks].reverse();
  const bids = orderBook.bids;

  return (
    <div>
      {/* Header */}
      <div className="order-book-header-row">
        <span>PRICE</span>
        <span className="text-right">SHARES</span>
        <span className="text-right">TOTAL</span>
      </div>

      {/* Asks */}
      <div className="mb-1">
        <div className="order-book-label order-book-label--ask">Asks</div>
        {asks.map((entry, i) => (
          <div key={`ask-${i}`} className="order-book-row order-book-row--ask">
            <span>{formatPrice(entry.price)}</span>
            <span className="text-right">{formatShares(entry.shares)}</span>
            <span className="text-right">{formatTotal(entry.total)}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="order-book-spread">
        Last: {formatPrice(orderBook.lastTradePrice)} &nbsp;&middot;&nbsp; Spread: {formatPrice(orderBook.spread)}
      </div>

      {/* Bids */}
      <div className="mt-1">
        <div className="order-book-label order-book-label--bid">Bids</div>
        {bids.map((entry, i) => (
          <div key={`bid-${i}`} className="order-book-row order-book-row--bid">
            <span>{formatPrice(entry.price)}</span>
            <span className="text-right">{formatShares(entry.shares)}</span>
            <span className="text-right">{formatTotal(entry.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
