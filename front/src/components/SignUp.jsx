import React, { use } from 'react'
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
const SignUp = () => {
  const [state, setState] = useState("register")
  const [formData, setFormData] = useState({
    name:"",
    email:"",
    password:"",
    confirmPassword:"",
  })
  return (
    <div>
      sigup
    </div>
  )
}

export default SignUp
