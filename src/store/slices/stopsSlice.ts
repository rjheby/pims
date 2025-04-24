import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DeliveryStop } from "@/pages/dispatch/components/stops/types";

interface StopsState {
  items: DeliveryStop[];
  loading: boolean;
  error: string | null;
}

const initialState: StopsState = {
  items: [],
  loading: false,
  error: null,
};

const stopsSlice = createSlice({
  name: "stops",
  initialState,
  reducers: {
    setStops: (state, action: PayloadAction<DeliveryStop[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addStop: (state, action: PayloadAction<DeliveryStop>) => {
      state.items.push(action.payload);
    },
    updateStop: (state, action: PayloadAction<DeliveryStop>) => {
      const index = state.items.findIndex((stop) => stop.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteStop: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((stop) => stop.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setStops,
  addStop,
  updateStop,
  deleteStop,
  setLoading,
  setError,
} = stopsSlice.actions;

export default stopsSlice.reducer; 