import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';

// Typed useDispatch hook for the app
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
