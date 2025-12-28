import { Navigate } from 'react-router-dom';

const ProductedRoute = ({children}) => {
  const token = localStorage.getItem('adminToken');
  if(!token){
    return <Navigate to="/admin/login" replace />
  }
  return children
};

export default ProductedRoute;
