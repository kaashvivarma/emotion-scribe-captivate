
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
    isLoading: false,
    error: null
  };

  try {
    status.isLoading = true;
    
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
      throw new Error('Keyfacial model not loaded');
    }
    
    const processedImage = await preprocessImage(imageData);
    
    // Make prediction
    const prediction = await keyfacialModel.predict(processedImage) as tf.Tensor;
    
    // Convert prediction to array
    const keypointsArray = await prediction.array();
    
    // Format keypoints as pairs of [x, y] coordinates
    // Assuming the model outputs a flat array of 30 values (15 pairs of x,y coordinates)
    const keypoints: number[][] = [];
    for (let i = 0; i < 30; i += 2) {
      keypoints.push([keypointsArray[0][i], keypointsArray[0][i + 1]]);
    }
    
    return keypoints;
  } catch (error) {
    console.error('Error predicting facial keypoints:', error);
    throw error;
  }
}

export async function predictFacialEmotion(imageData: string): Promise<{emotion: string, confidence: number}> {
  try {
    const facialEmotionModel = (window as any).facialEmotionModel;
    if (!facialEmotionModel) {
      throw new Error('Facial emotion model not loaded');
    }
    
    const processedImage = await preprocessImage(imageData);
    
    // Make prediction
    const prediction = await facialEmotionModel.predict(processedImage) as tf.Tensor;
    
    // Convert prediction to array
    const emotionProbabilities = await prediction.array();
    
    // Find the emotion with highest probability
    const emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];
    const maxProbIndex = emotionProbabilities[0].indexOf(Math.max(...emotionProbabilities[0]));
    const emotion = emotions[maxProbIndex];
    const confidence = emotionProbabilities[0][maxProbIndex];
    
    return { emotion, confidence };
  } catch (error) {
    console.error('Error predicting facial emotion:', error);
    throw error;
  }
}

export async function predictSpeechEmotion(audioBlob: Blob): Promise<{emotion: string, confidence: number}> {
  try {
    const mlpModel = (window as any).speechEmotionMlpModel;
    if (!mlpModel) {
      throw new Error('Speech emotion models not loaded');
    }
    
    // Extract features from audio
    const features = await extractAudioFeatures(audioBlob);
    
    // In a real implementation, you would:
    // 1. Apply the standard scaler (stdscaler.pkl) to normalize features
    // 2. Run the MLP model prediction
    // 3. Run the XGBoost model prediction
    // 4. Combine them with 0.3 * mlp + 0.7 * xgboost
    // 5. Apply the mood encoder (mood_encode.pkl) to get the final emotion
    
    // For this demo, we'll simulate a prediction
    const emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const confidence = Math.random() * 0.5 + 0.5; // Random between 0.5 and 1
    
    return { emotion: randomEmotion, confidence };
  } catch (error) {
    console.error('Error predicting speech emotion:', error);
    throw error;
  }
}
