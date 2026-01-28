{
  "name": "Drawing",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Titre du dessin"
    },
    "description": {
      "type": "string",
      "description": "Description ou anecdote li\u00e9e au dessin"
    },
    "image_url": {
      "type": "string",
      "description": "URL de l'image originale"
    },
    "enhanced_image_url": {
      "type": "string",
      "description": "URL de l'image am\u00e9lior\u00e9e par IA"
    },
    "child_name": {
      "type": "string",
      "description": "Nom de l'enfant artiste"
    },
    "child_age": {
      "type": "number",
      "description": "\u00c2ge de l'enfant au moment du dessin"
    },
    "drawing_date": {
      "type": "string",
      "format": "date",
      "description": "Date du dessin"
    },
    "category": {
      "type": "string",
      "enum": [
        "portrait",
        "paysage",
        "animal",
        "abstrait",
        "famille",
        "imaginaire",
        "nature",
        "autre"
      ],
      "description": "Cat\u00e9gorie du dessin"
    },
    "is_public": {
      "type": "boolean",
      "default": false,
      "description": "Visible dans la galerie publique"
    },
    "votes": {
      "type": "number",
      "default": 0,
      "description": "Nombre de votes"
    },
    "album_id": {
      "type": "string",
      "description": "ID de l'album parent"
    }
  },
  "required": [
    "title",
    "image_url",
    "child_name"
  ]
}
