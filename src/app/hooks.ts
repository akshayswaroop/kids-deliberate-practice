import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Typed useDispatch hook for the app
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed useSelector hook for the app
export const useAppSelector = useSelector.withTypes<RootState>();

export default useAppDispatch;
