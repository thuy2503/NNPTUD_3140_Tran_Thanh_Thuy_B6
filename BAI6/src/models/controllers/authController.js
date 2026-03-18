const User = require('../User');
const { signToken } = require('../config/jwt');

const validatePassword = (password) => {
    const errors = [];
    if (!password || password.length < 8) errors.push('Ít nhất 8 ký tự');
    if (!/[A-Z]/.test(password)) errors.push('Ít nhất 1 chữ HOA');
    if (!/[a-z]/.test(password)) errors.push('Ít nhất 1 chữ thường');
    if (!/[0-9]/.test(password)) errors.push('Ít nhất 1 số');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Ít nhất 1 ký tự đặc biệt');
    return { valid: errors.length === 0, errors };
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const validation = validatePassword(password);
        if (!validation.valid) {
            return res.status(400).json({ success: false, errors: validation.errors });
        }
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User đã tồn tại' });
        }
        
        const user = new User({ username, email, password });
        await user.save();
        
        res.status(201).json({ success: true, message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Sai username hoặc password' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Sai username hoặc password' });
        }
        
        const token = signToken({ id: user._id, username: user.username, role: user.role });
        
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token: token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Thiếu oldPassword hoặc newPassword' });
        }
        
        const validation = validatePassword(newPassword);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới không hợp lệ', errors: validation.errors });
        }
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
        }
        
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Mật khẩu cũ không đúng' });
        }
        
        if (oldPassword === newPassword) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới không được trùng với cũ' });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};