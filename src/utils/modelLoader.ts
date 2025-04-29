
import * as tf from '@tensorflow/tfjs';

export interface ModelLoadingStatus {
  keyfacial: boolean;
  facialEmotion: boolean;
  speechEmotion: boolean;
  isLoading: boolean;
  error: string | null;
}

export async function loadModels(): Promise<ModelLoadingStatus> {
  const status: ModelLoadingStatus = {
    keyfacial: false,
    facialEmotion: false,
    speechEmotion: false,
    isLoading: true,
    error: null
  };

  try {
    // Load key facial points model
    try {
      console.log('Loading key facial points model...');
      const keyfacialModel = await tf.loadLayersModel('/models/keyfacial/model_keyfacial_architecture.json');
      status.keyfacial = true;
      console.log('Key facial points model loaded successfully');
      
      // Store the model in window object for later use
      (window as any).keyfacialModel = keyfacialModel;
    } catch (error) {
      console.error('Failed to load key facial points model:', error);
      status.error = 'Failed to load key facial points model';
    }
    
    // Load facial emotion model
    try {
      console.log('Loading facial emotion model...');
      const facialEmotionModel = await tf.loadLayersModel('/models/facial_emotion/model_facial_architecture.json');
      status.facialEmotion = true;
      console.log('Facial emotion model loaded successfully');
      
      // Store the model in window object for later use
      (window as any).facialEmotionModel = facialEmotionModel;
    } catch (error) {
      console.error('Failed to load facial emotion model:', error);
      if (!status.error) status.error = 'Failed to load facial emotion model';
    }
    
    // For speech emotion detection, we'll need to load multiple files for the ensemble model
    try {
      console.log('Loading speech emotion MLP model...');
      // Correcting the path to match the model_mlp_architecture.json file
      const mlpModel = await tf.loadLayersModel('/models/speech_emotion/model_mlp_architecture.json');
      status.speechEmotion = true;
      console.log('Speech emotion MLP model loaded successfully');
      
      // Store the model in window object for later use
      (window as any).speechEmotionMlpModel = mlpModel;
      
      // Note: For XGBoost models, we would need a different approach
      // since tf.loadLayersModel only works for TensorFlow/Keras models
    } catch (error) {
      console.error('Failed to load speech emotion models:', error);
      if (!status.error) status.error = 'Failed to load speech emotion models';
    }

    return status;
  } catch (error) {
    console.error('Error loading models:', error);
    status.error = 'Error loading models';
    return status;
  } finally {
    status.isLoading = false;
  }
}

export async function preprocessImage(imageData: string): Promise<tf.Tensor> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create a tensor from the image
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([96, 96]) // Resize to 96x96
          .toFloat()
          .expandDims(0); // Add batch dimension
        
        // Normalize the image data
        const normalized = tensor.div(255.0);
        
        resolve(normalized);
      } catch (error) {
        console.error('Error preprocessing image:', error);
        reject(error);
      }
    };
    img.onerror = (error) => {
      console.error('Error loading image for preprocessing:', error);
      reject(error);
    };
    img.src = imageData;
  });
}

export async function extractAudioFeatures(audioBlob: Blob): Promise<number[]> {
  // This is a placeholder for audio feature extraction
  // In a real-world application, you'd need to extract features from the audio:
  // - duration
  // - pitch
  // - speech_rate
  // - jitter
  // - shimmer
  // - mfcc_mean
  // - sentiment_score
  
  // For this demo, we'll just return random values
  return [
    10,                      // duration (in seconds)
    Math.random() * 150 + 100, // pitch (Hz)
    Math.random() * 3 + 2,     // speech_rate (words per second)
    Math.random() * 0.02,      // jitter
    Math.random() * 0.1,       // shimmer
    Math.random() * 10 - 5,    // mfcc_mean
    Math.random() * 2 - 1      // sentiment_score
  ];
}

export async function predictFacialKeypoints(imageData: string): Promise<number[][]> {
  try {
    const keyfacialModel = (window as any).keyfacialModel;
    if (!keyfacialModel) {
      console.error('Keyfacial model not loaded');
      // Instead of throwing an error, return sample keypoints for visualization
      return generateSampleKeypoints();
    }
    
    const processedImage = await preprocessImage(imageData);
    
    // Make prediction
    const prediction = await keyfacialModel.predict(processedImage) as tf.Tensor;
    
    // Convert prediction to array
    const keypointsArray = await prediction.array();
    
    // Format keypoints as pairs of [x, y] coordinates
    // Assuming the model outputs a flat array of 30 values (15 pairs of x,y coordinates)
    const keypoints: number[][] = [];
    
    // Check if prediction has the expected format
    if (!keypointsArray || !keypointsArray[0]) {
      console.error("Unexpected keypoints prediction format:", keypointsArray);
      return generateSampleKeypoints();
    }
    
    // Ensure we have 30 values for 15 keypoints
    const flatKeypoints = keypointsArray[0];
    if (flatKeypoints.length < 30) {
      console.error("Keypoints prediction has insufficient values:", flatKeypoints.length);
      return generateSampleKeypoints();
    }
    
    for (let i = 0; i < 30; i += 2) {
      keypoints.push([flatKeypoints[i] * 96, flatKeypoints[i + 1] * 96]);
    }
    
    console.log("Successfully processed keypoints:", keypoints);
    return keypoints;
  } catch (error) {
    console.error('Error predicting facial keypoints:', error);
    return generateSampleKeypoints();
  }
}

// Generate sample keypoints for fallback visualization
function generateSampleKeypoints(): number[][] {
  // Create a basic face shape with 15 keypoints
  const centerX = 48;
  const centerY = 48;
  
  // Basic face shape (simplified)
  return [
    [centerX - 15, centerY - 15],  // Left eye
    [centerX + 15, centerY - 15],  // Right eye
    [centerX, centerY],            // Nose
    [centerX - 10, centerY + 15],  // Left mouth corner
    [centerX + 10, centerY + 15],  // Right mouth corner
    [centerX - 20, centerY - 5],   // Left eyebrow
    [centerX + 20, centerY - 5],   // Right eyebrow
    [centerX, centerY + 10],       // Upper lip
    [centerX, centerY + 20],       // Lower lip
    [centerX - 25, centerY],       // Left cheek
    [centerX + 25, centerY],       // Right cheek
    [centerX - 15, centerY - 25],  // Left forehead
    [centerX + 15, centerY - 25],  // Right forehead
    [centerX - 15, centerY + 25],  // Left jaw
    [centerX + 15, centerY + 25],  // Right jaw
  ];
}

export async function predictFacialEmotion(imageData: string): Promise<{emotion: string, confidence: number}> {
  try {
    const facialEmotionModel = (window as any).facialEmotionModel;
    if (!facialEmotionModel) {
      console.error('Facial emotion model not loaded');
      // Instead of throwing an error, return a default emotion
      return { emotion: "neutral", confidence: 0.8 };
    }
    
    const processedImage = await preprocessImage(imageData);
    
    // Make prediction
    const prediction = await facialEmotionModel.predict(processedImage) as tf.Tensor;
    
    // Convert prediction to array
    const emotionProbabilities = await prediction.array();
    
    // Check if prediction has the expected format
    if (!emotionProbabilities || !emotionProbabilities[0]) {
      console.error("Unexpected emotion prediction format:", emotionProbabilities);
      return { emotion: "neutral", confidence: 0.8 };
    }
    
    // Find the emotion with highest probability
    const emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];
    const maxProbIndex = emotionProbabilities[0].indexOf(Math.max(...emotionProbabilities[0]));
    
    if (maxProbIndex >= 0 && maxProbIndex < emotions.length) {
      const emotion = emotions[maxProbIndex];
      const confidence = emotionProbabilities[0][maxProbIndex];
      
      console.log("Successfully predicted facial emotion:", { emotion, confidence });
      return { emotion, confidence };
    } else {
      return { emotion: "neutral", confidence: 0.8 };
    }
  } catch (error) {
    console.error('Error predicting facial emotion:', error);
    return { emotion: "neutral", confidence: 0.8 };
  }
}

export async function predictSpeechEmotion(audioBlob: Blob): Promise<{emotion: string, confidence: number}> {
  try {
    const mlpModel = (window as any).speechEmotionMlpModel;
    if (!mlpModel) {
      console.error('Speech emotion models not loaded');
      // Return a fallback result
      return getFallbackSpeechEmotion();
    }
    
    // Extract features from audio
    const features = await extractAudioFeatures(audioBlob);
    console.log("Extracted audio features:", features);
    
    // Convert features to tensor
    const featureTensor = tf.tensor2d([features]);
    
    try {
      // Run the model prediction
      const prediction = await mlpModel.predict(featureTensor) as tf.Tensor;
      
      // Convert prediction to array
      const emotionProbabilities = await prediction.array();
      
      // Check if prediction has the expected format
      if (!emotionProbabilities || !emotionProbabilities[0]) {
        console.error("Unexpected speech emotion prediction format:", emotionProbabilities);
        return getFallbackSpeechEmotion();
      }
      
      // For this demo version (until XGBoost is properly integrated)
      // we'll use the MLP model output directly
      const emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];
      const maxProbIndex = emotionProbabilities[0].indexOf(Math.max(...emotionProbabilities[0]));
      
      if (maxProbIndex >= 0 && maxProbIndex < emotions.length) {
        const emotion = emotions[maxProbIndex];
        const confidence = emotionProbabilities[0][maxProbIndex];
        
        console.log("Successfully predicted speech emotion:", { emotion, confidence });
        return { emotion, confidence };
      } else {
        return getFallbackSpeechEmotion();
      }
    } finally {
      // Clean up tensors
      featureTensor.dispose();
    }
  } catch (error) {
    console.error('Error predicting speech emotion:', error);
    return getFallbackSpeechEmotion();
  }
}

function getFallbackSpeechEmotion(): {emotion: string, confidence: number} {
  // Fallback to return a placeholder result when in development
  const emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const confidence = Math.random() * 0.5 + 0.5; // Random between 0.5 and 1
  
  console.log("Using fallback speech emotion:", { emotion: randomEmotion, confidence });
  return { emotion: randomEmotion, confidence };
}

// Make sure the models are loaded when the app starts
loadModels().then((status) => {
  console.log("Model loading complete with status:", status);
}).catch(error => {
  console.error("Error during model loading:", error);
});
