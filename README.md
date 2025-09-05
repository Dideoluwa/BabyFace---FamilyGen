# BabyFace & FamilyGen - AI Image Transformation Suite

An app that uses Google's Gemini 2.5 Flash Image Preview to transform images with two unique capabilities: creating baby versions of adult faces and generating realistic family portraits with children.

## Features

###  Baby Face Generation
- **Adult-to-Baby Transformation**: Places adult faces on baby bodies while preserving all facial features
- **Race & Ethnicity Preservation**: Maintains exact racial characteristics and skin tones
- **Headgear Removal**: Automatically removes caps, hats, helmets, and other head accessories
- **Seamless Blending**: Creates natural transitions between adult face and baby body
- **High-Quality Output**: Ultra-high resolution, photorealistic images

### Family Generation
- **Two-Parent Upload**: Upload photos of both parents
- **Customizable Children**: Specify number of children (1-6), age gaps, and youngest age
- **Random Gender Assignment**: Realistic mix of boys and girls
- **Family Resemblance**: Children inherit features from both parents
- **Professional Portraits**: Beautiful family photography settings

##  Quick Start

## API Documentation

### Baby Face Generation

**Endpoint**: `POST /api/generate-image`

Transform an adult face onto a baby body.


### Family Generation

**Endpoint**: `POST /api/generate-family`

Generate a family portrait with children.

##  Configuration Options

### Family Generation Parameters
- **Number of Children**: 1-6 (default: 2)
- **Age Gap**: 1-5 years between children (default: 2)
- **Youngest Age**: 1-12 years (default: 4)


##  Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `2004` |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |


## Use Cases

### Baby Face Generation
- **Social Media Content**: Create humorous baby versions of friends/family
- **Memes & Entertainment**: Generate funny baby face transformations
- **Creative Projects**: Artistic interpretations of adult faces as babies
- **Personal Keepsakes**: Create unique baby photos for special occasions

### Family Generation
- **Future Planning**: Visualize how your children might look
- **Family Portraits**: Generate professional family photos
- **Social Sharing**: Create family images for social media
- **Memory Creation**: Generate family photos for keepsakes
