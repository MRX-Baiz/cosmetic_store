import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  YouTube,
  LocationOn,
  Phone,
  Email,
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2c2c2c',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#e91e63' }}>
              MRX_BEAUTY
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              Votre destination premium pour tous vos besoins en cosmétiques et produits de beauté. 
              Nous offrons une sélection soigneusement choisie des meilleures marques du monde.
            </Typography>
            
            {/* Contact Info */}
            <Box sx={{ mt: 3 }}>
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: '#e91e63' }} />
                <Typography variant="body2">
                  123 Beauty Street, Casablanca, Morocco
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Phone sx={{ mr: 1, color: '#e91e63' }} />
                <Typography variant="body2">
                  +212 655-482-888
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Email sx={{ mr: 1, color: '#e91e63' }} />
                <Typography variant="body2">
                  mrxbaiz@gmail.com
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
              Liens Rapides
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Accueil
              </Link>
              <Link href="/products" color="inherit" underline="hover">
                Produits
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                À Propos
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact
              </Link>
              <Link href="/faq" color="inherit" underline="hover">
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Categories */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
              Catégories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products?category=skincare" color="inherit" underline="hover">
                Soins de la Peau
              </Link>
              <Link href="/products?category=makeup" color="inherit" underline="hover">
                Maquillage
              </Link>
              <Link href="/products?category=haircare" color="inherit" underline="hover">
                Soins des Cheveux
              </Link>
              <Link href="/products?category=fragrance" color="inherit" underline="hover">
                Parfums
              </Link>
              <Link href="/products?category=tools" color="inherit" underline="hover">
                Outils
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
              Service Client
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/shipping" color="inherit" underline="hover">
                Livraison
              </Link>
              <Link href="/returns" color="inherit" underline="hover">
                Retours
              </Link>
              <Link href="/size-guide" color="inherit" underline="hover">
                Guide des Tailles
              </Link>
              <Link href="/privacy" color="inherit" underline="hover">
                Politique de Confidentialité
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Conditions d'Utilisation
              </Link>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ color: '#e91e63' }}>
              Suivez-nous
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Restez connecté avec nous sur les réseaux sociaux
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#1877f2',
                  backgroundColor: 'rgba(24, 119, 242, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(24, 119, 242, 0.2)',
                  },
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#e4405f',
                  backgroundColor: 'rgba(228, 64, 95, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(228, 64, 95, 0.2)',
                  },
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#000000',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  TT
                </Typography>
              </IconButton>
              <IconButton
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#ff0000',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                  },
                }}
              >
                <YouTube />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: '#555' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} MRX_BEAUTY. Tous droits réservés.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Paiement sécurisé
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Livraison gratuite dès 50€
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Retours sous 30 jours
            </Typography>
          </Box>
        </Box>

        {/* Additional Info */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            MRX_BEAUTY - Votre partenaire beauté de confiance depuis 2025
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;


