import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

// Typed useDispatch hook for Redux infrastructure
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed useSelector hook for Redux infrastructure
export const useAppSelector = useSelector.withTypes<RootState>();

export default useAppDispatch;