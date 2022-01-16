const express = require("express");
const router = express.Router();


const data = Object.create(null);

data.aliases = {
  input_types: 'Input File Types',
  output_types: 'Output File Types',
  maximum_size: 'Maximum File Size',
  daily_conv_limit: 'Daily Conversion Limit',
  file_lifetime: 'File Lifetime',
  configuration: 'Configuration',
}

data.icons = {
  input_types: 'fa-file-upload',
  output_types: 'fa-file-download',
  maximum_size: 'fa-archive',
  daily_conv_limit: 'fa-clock',
  file_lifetime: 'fa-file-medical-alt',
  configuration: 'fa-sliders-h',
}

data.pricing = {
  free: {
    price: '0',
    description: 'Free benefits for guests, anyone who visits this website can enjoy this benefits without logging in.',
    benefits: {
      input_types: 'PDF',
      output_types: 'Standard',
      maximum_size: '50MB',
      daily_conv_limit: '5 files',
      file_lifetime: '1 day',
      configuration: 'Default'
    },
    button: {
      text: 'Default'
    }
  },
  basic: {
    price: '0',
    description: 'For users who already have an account.',
    benefits: {
      input_types: 'PDF',
      output_types: 'Standard',
      maximum_size: '50MB',
      daily_conv_limit: '10 files',
      file_lifetime: '1 day',
      configuration: 'Default'
    },
    button: {
      text: 'Sign up',
      url: '/register'
    }
  },
  premium: {
    price: '4.99',
    description: 'Tips: Buy Yearly subscription package for 10% discount.',
    benefits: {
      input_types: 'PDF',
      output_types: 'Extended',
      maximum_size: 'Unlimited',
      daily_conv_limit: 'Unlimited',
      file_lifetime: '7 days',
      configuration: 'Customizable'
    },
    button: {
      text: 'Buy now',
      url: '#'
    }
  }
}

data.annotate = {
  output_types: {
    Standard: 'PNG, SVG',
    Extended: 'PNG, SVG, JPEG, TIFF'
  }
}

data.explaination = [
  {
    name: 'input_types',
    content: 'The file format that our server accepts. For the time being, only include PDF format. We will support other document and archive formats in the future.'
  },
  {
    name: 'output_types',
    content: 'The file format we support converting to.\nStandard: PNG, SVG\nExtended: PNG, SVG, JPEG, TIFF'
  },
  {
    name: 'maximum_size',
    content: 'The size, in bytes, for a single upload. This rule will be adjusted separately between compressed file size and unpacked file size in future. ',
  },
  {
    name: 'daily_conv_limit',
    content: 'Number of files allowed to convert per day, daily reset at 0:00.'
  }, 
  {
    name: 'file_lifetime',
    content: 'The lifespan of the output file continues to be stored on our system, starting from the moment you successfully perform the conversion.',
  },
  {
    name: 'configuration',
    content: 'User-desired adjustments to the output file. E.g: DPI, page sizes, etc.',
  }
]


// Pricing route
router.get('/', (req, res, next) => res.render('pricing', data));


module.exports = router;
