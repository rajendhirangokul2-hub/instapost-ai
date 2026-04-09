import { Store, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Shop } from "@/hooks/useShops";

interface Props {
  shops: Shop[];
  activeShop: Shop | null;
  onSelect: (shop: Shop) => void;
}

const ShopSwitcher = ({ shops, activeShop, onSelect }: Props) => {
  if (shops.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border text-foreground max-w-[180px]">
          <Store className="h-4 w-4 shrink-0" />
          <span className="truncate">{activeShop?.name || "Select Shop"}</span>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shops.map(shop => (
          <DropdownMenuItem key={shop.id} onClick={() => onSelect(shop)} className="gap-2">
            {shop.logo_url ? (
              <img src={shop.logo_url} className="h-4 w-4 rounded object-contain" />
            ) : (
              <Store className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="truncate">{shop.name}</span>
            {shop.is_default && <span className="text-xs text-primary ml-auto">Default</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShopSwitcher;
