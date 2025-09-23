
const Product = require('../models/Product'); // Assuming Product model is in ../models/Product
const https = require('https'); // Change to require https

let productKnowledgeBase = [];

// Function to calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) return 0; // Avoid division by zero
  return dotProduct / (magnitudeA * magnitudeB);
};

// Function to generate embeddings for a given text
const generateEmbeddings = async (text) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ content: { parts: [{ text }] } });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const responseBody = JSON.parse(data);
          resolve(responseBody.embedding.values);
        } else {
          const errorBody = JSON.parse(data);
          console.error('API Error response:', errorBody);
          reject(new Error(`API error: ${res.statusCode} ${res.statusMessage} - ${JSON.stringify(errorBody)}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error during HTTPS request:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Function to retrieve relevant product information based on a query
const retrieveRelevantProductInfo = async (query) => {
  if (!productKnowledgeBase.length) {
    console.warn('Product knowledge base is empty. Returning no context.');
    return null;
  }

  try {
    const queryEmbedding = await generateEmbeddings(query);
    if (!queryEmbedding) {
      console.error('Failed to generate embedding for query.');
      return null;
    }

    let maxSimilarity = -1;
    let relevantProduct = null;

    for (const productInfo of productKnowledgeBase) {
      const similarity = cosineSimilarity(queryEmbedding, productInfo.embedding);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        relevantProduct = productInfo.text;
      }
    }
    // You might want to set a threshold for similarity here, e.g., if maxSimilarity < 0.7, return null
    return relevantProduct;
  } catch (error) {
    console.error('Error retrieving relevant product info:', error);
    return null;
  }
};

// Function to initialize the product knowledge base with embeddings
const initializeProductKnowledgeBase = async () => {
  try {
    const products = await Product.find({});
    productKnowledgeBase = []; // Clear existing knowledge base
    for (const product of products) {
      const productText = `Name: ${product.name}. Description: ${product.description}. Price: ${product.price} DH. Category: ${product.category}. Brand: ${product.brand}.`;
      const embedding = await generateEmbeddings(productText);
      if (embedding) {
        productKnowledgeBase.push({ text: productText, embedding });
      }
    }
    console.log(`Product knowledge base initialized with ${productKnowledgeBase.length} products.`);
  } catch (error) {
    console.error('Error initializing product knowledge base:', error);
  }
};

module.exports = {
  initializeProductKnowledgeBase,
  generateEmbeddings,
  productKnowledgeBase,
  retrieveRelevantProductInfo,
};
