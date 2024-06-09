import db from '../models'
import bcrypt from 'bcryptjs'  // đổi password thanhf những kí tự đặc biệt
import jwt from 'jsonwebtoken' // sẽ có 1 cái token gửi về cho client
import makeid from 'uniqid' // tạo ra 1 đoạn mã ko giống nhau
require('dotenv').config()

const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(12))

export const registerService = ({ phone, password, name, email }) => new Promise(async (resolve, reject) => {
    try {                               // tìm và tạo
        const response = await db.User.findOrCreate({ // hứng response trả về 1 cái mảng 
            where: { phone }, // ktra sdt co hay chưa
            defaults: {
                phone,
                name,
                password: hashPassword(password),
                //  password,
                id: makeid(),
                zalo: phone,
                email
            }
        })
        const token = response[1] && jwt.sign({ id: response[0].id, phone: response[0].phone, role: response[0].role }, process.env.SECRET_KEY, { expiresIn: '2d' }) // token dc tạo khi user dc tạo mới thành công
        resolve({
            err: token ? 0 : 2,
            msg: token ? 'Đăng ký thành công !' : 'Số điện thoại đã được sử dụng !',
            token: token || null
        })

    } catch (error) {
        reject(error)
    }
})

export const loginService = ({ phone, password }) => new Promise(async (resolve, reject) => {
    try {
        const response = await db.User.findOne({
            where: { phone },
            raw: true
        })
        const isCorrectPassword = response && bcrypt.compareSync(password, response.password)
        const token = isCorrectPassword && jwt.sign({ id: response.id, phone: response.phone, role: response.role }, process.env.SECRET_KEY, { expiresIn: '2d' })
        resolve({
            err: token ? 0 : 2,
            msg: token ? 'Đăng nhập thành công !' : response ? 'Mật khẩu lỗi !' : 'Số điện thoại không đúng !',
            token: token || null
        })

    } catch (error) {
        reject(error)
    }
})