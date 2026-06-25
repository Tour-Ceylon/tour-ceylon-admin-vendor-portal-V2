import { Outlet } from "react-router";
import { StayHotelProvider } from "./StayHotelContext";

export function HotelOperationsLayout() {
  return (
    <StayHotelProvider>
      <Outlet />
    </StayHotelProvider>
  );
}
