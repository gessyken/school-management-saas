import User from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';

// Register a user under a specific school
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation des champs requis
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        errors: {
          email: !email ? 'L\'email est requis' : null,
          password: !password ? 'Le mot de passe est requis' : null,
          name: !name ? 'Le nom est requis' : null,
          phone: !phone ? 'Le téléphone est requis' : null,
        }
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre' 
      });
    }

    // Validation du nom
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Le nom doit contenir entre 2 et 50 caractères' });
    }

    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({ 
        message: 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets' 
      });
    }

    // Validation du téléphone
    const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
    if (!phoneRegex.test(phone) || phone.length < 8 || phone.length > 15) {
      return res.status(400).json({ message: 'Format de téléphone invalide' });
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Cet email est déjà utilisé',
        field: 'email',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Séparer le nom en prénom et nom de famille
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phoneNumber: phone,
      memberships: [] // No school yet
    });

    await user.save();

    const token = generateToken(user._id, null); // no school yet
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Échec de l\'inscription', error: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email et mot de passe sont requis',
        errors: {
          email: !email ? 'L\'email est requis' : null,
          password: !password ? 'Le mot de passe est requis' : null,
        }
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password email firstName lastName memberships.school memberships.roles ');
    if (!user) return res.status(404).json({ message: 'Email ou mot de passe incorrect' });

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });

    // Populate memberships.school with school info (name, etc)
    await user.populate({
      path: 'memberships.school',
      select: 'name email subdomain accessStatus' // select fields you want to expose
    });

    // Return user info WITHOUT password, and schools list
    const userData = user.toObject();
    delete userData.password;
    delete userData.security;

    // Token without school selected yet, user just logged in
    const token = generateToken(user._id, null);

    res.status(200).json({ token, user: userData, });

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Échec de la connexion', error: err.message });
  }
};


// Get current user (from token)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};
