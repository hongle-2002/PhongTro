import React, { memo, useEffect, useState } from 'react'
import { Select, InputReadOnly } from '../components'
import { apiGetPublicProvinces, apiGetPublicDistrict, apiGetPublicWards } from '../services'
import { useSelector } from 'react-redux'

const Address = ({ payload, setPayload, invalidFields, setInvalidFields, resetFieldsCallback }) => {
  const { dataEdit } = useSelector(state => state.post)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [ward, setWard] = useState('')
  const [street, setStreet] = useState('') // Thêm state để lưu giá trị đường phố
  const [reset, setReset] = useState(false)


  useEffect(() => {
    if (dataEdit) {
      let addressArr = dataEdit?.address.split(',')
      let foundProvince = provinces?.length && provinces?.find(item => item.province_name === addressArr[addressArr?.length - 1]?.trim())
      setProvince(foundProvince ? foundProvince.province_id : '')
    }
  }, [provinces, dataEdit])

  useEffect(() => {
    if (dataEdit) {
      let addressArr = dataEdit?.address.split(',')
      let foundDistrict = districts?.length > 0 && districts?.find(item => item.district_name === addressArr[addressArr?.length - 2]?.trim())
      setDistrict(foundDistrict ? foundDistrict.district_id : '')
    }
  }, [districts, dataEdit])

  useEffect(() => {
    if (dataEdit) {
      let addressArr = dataEdit?.address.split(',')
      let foundWard = wards?.length > 0 && wards?.find(item => item.ward_name === addressArr[addressArr?.length - 3]?.trim())
      setWard(foundWard ? foundWard.ward_id : '')
    }
  }, [wards, dataEdit])

  useEffect(() => {
    if (dataEdit) {
      let addressArr = dataEdit?.address.split(',')
      // Đảm bảo lấy phần street chính xác bao gồm tất cả ký tự đặc biệt
      let foundStreet = addressArr.slice(0, addressArr.length - 3).join(',').trim()
      setStreet(foundStreet ? foundStreet : '')
    }
  }, [dataEdit])

  useEffect(() => {
    const fetchPublicProvince = async () => {
      const response = await apiGetPublicProvinces()
      if (response.status === 200) {
        setProvinces(response?.data.results)
      }
    }
    fetchPublicProvince()
  }, [])

  useEffect(() => {
    setDistrict('')
    const fetchPublicDistrict = async () => {
      const response = await apiGetPublicDistrict(province)
      if (response.status === 200) {
        setDistricts(response.data?.results)
      }
    }
    province && fetchPublicDistrict()
    !province ? setReset(true) : setReset(false)
    !province && setDistricts([])
  }, [province])

  useEffect(() => {
    setWard('')
    const fetchPublicWard = async () => {
      const response = await apiGetPublicWards(district)
      if (response.status === 200) {
        setWards(response.data?.results)
      }
    }
    district && fetchPublicWard()
    !district ? setReset(true) : setReset(false)
    !district && setWards([])
  }, [district])

  useEffect(() => {
    setPayload(prev => ({
      ...prev,
      address: `${street ? `${street}, ` : ''}${ward ? `${wards?.find(item => item.ward_id === ward)?.ward_name}, ` : ''}${district ? `${districts?.find(item => item.district_id === district)?.district_name}, ` : ''}${province ? provinces?.find(item => item.province_id === province)?.province_name : ''}`,
      province: province ? provinces?.find(item => item.province_id === province)?.province_name : '',
    }))
  }, [province, district, ward, street]) // Thêm street vào dependencies

  // useEffect(() => {
  //   if (payload.province) setProvince(payload.province);
  //   if (payload.district) setDistrict(payload.district);
  //   if (payload.ward) setWard(payload.ward);
  //   if (payload.street) setStreet(payload.street);
  // }, [payload]);

  useEffect(() => {
    if (resetFieldsCallback) {
      resetFieldsCallback(() => {
        setProvince('');
        setDistrict('');
        setWard('');
        setStreet('');
      });
    }
  }, [resetFieldsCallback]);


  return (
    <div>
      <h2 className='font-semibold text-xl py-4'>Địa chỉ cho thuê</h2>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-4'>
          <Select
            setInvalidFields={setInvalidFields}
            invalidFields={invalidFields}
            type='province'
            value={province}
            setValue={setProvince}
            options={provinces}
            label='Tỉnh/Thành phố'
          />
          <Select
            setInvalidFields={setInvalidFields}
            invalidFields={invalidFields}
            reset={reset}
            type='district'
            value={district}
            setValue={setDistrict}
            options={districts}
            label='Quận/Huyện'
          />
          <Select
            setInvalidFields={setInvalidFields}
            invalidFields={invalidFields}
            reset={reset}
            type='ward'
            value={ward}
            setValue={setWard}
            options={wards}
            label='Phường/Xã'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label className='font-medium' htmlFor='house-number'> Số nhà, Đường phố</label>
          <input
            type='text'
            id='house-number'
            className='border border-gray-200 rounded-md flex'
            value={street}
            onChange={(e) => setStreet(e.target.value)} // Cập nhật giá trị đường phố
          />
        </div>
        <InputReadOnly
          label='Địa chỉ chính xác'
          value={`${street ? `${street}, ` : ''}${ward ? `${wards?.find(item => item.ward_id === ward)?.ward_name}, ` : ''}${district ? `${districts?.find(item => item.district_id === district)?.district_name}, ` : ''}${province ? provinces?.find(item => item.province_id === province)?.province_name : ''}`}
        />
      </div>
    </div>
  )
}

export default memo(Address)
