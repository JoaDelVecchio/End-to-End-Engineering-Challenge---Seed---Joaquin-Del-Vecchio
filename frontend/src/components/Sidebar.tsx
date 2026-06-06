import { Bell, ChevronDown, MessageCircle, Star } from "lucide-react";
import type { Seller } from "../domain/types";

export function Sidebar({ seller }: { seller: Seller | null }) {
  return (
    <aside className="sidebar">
      <div className="store-identity">
        <div className="brand-mark" aria-label="Panel de ventas de Mercado Libre">
          ML
        </div>
        {seller ? (
          <div className="store-copy" aria-label={`Tienda ${seller.name}, reputación ${seller.reputation}`}>
            <strong>{seller.name}</strong>
            <span>
              <Star size={11} aria-hidden="true" />
              {seller.reputation}
            </span>
          </div>
        ) : null}
      </div>

      <nav className="nav-stack" aria-label="Accesos del vendedor">
        <button className="nav-button notification-button" type="button" aria-label="Notificaciones">
          <Bell size={20} aria-hidden="true" />
          <span className="notification-dot" aria-hidden="true" />
        </button>
        <button className="nav-button" type="button" aria-label="Mensajes">
          <MessageCircle size={20} aria-hidden="true" />
        </button>
        <button className="profile-button" type="button" aria-label="Perfil del vendedor">
          <span className="profile-avatar" aria-hidden="true">
            {seller ? sellerInitials(seller.name) : ""}
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </nav>
    </aside>
  );
}

function sellerInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
