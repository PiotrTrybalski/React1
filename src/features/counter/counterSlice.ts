import {
  createSlice,
  PayloadAction,
  isAnyOf,
  isAsyncThunkAction,
  isRejectedWithValue,
  createAsyncThunk,
  createAction
} from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0
};

export const manualIncrement = createAction<number>("increment/manual");

export const incrementAsync = createAsyncThunk(
  "incrementAsync",
  async (amount: number, { rejectWithValue }) => {
    // this is just for example purposes - will reject sometimes :)
    if (Math.random() < 0.25) {
      return rejectWithValue({ error: "Random math error!" });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait a second...

    return amount;
  }
);

export const anotherAsyncThunk = createAsyncThunk(
  "anotherAsyncThunk",
  async () => {
    return "Hi!";
  }
);

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    decrement: (state) => {
      state.value -= 1;
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    }
  },
  extraReducers: (builder) => {
    // we'll match on the async action or the manual increment being that both have a payload of type `number`
    builder
      .addMatcher(
        isAnyOf(incrementAsync.fulfilled, manualIncrement),
        (state, action) => {
          state.value += action.payload;
        }
      )
      .addMatcher(isRejectedWithValue(incrementAsync), (state, action) => {
        console.log("Saw a rejected action incrementAsync action!", action);
      })
      .addMatcher(
        isAsyncThunkAction(anotherAsyncThunk, incrementAsync),
        (state, action) => {
          console.log(
            "I match on everything action dispatched by anotherAsyncThunk or incrementAsync regardless of the lifecycle"
          );
        }
      );
  }
});

export const { decrement } = counterSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
