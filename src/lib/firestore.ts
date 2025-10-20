import { collection, getDocs, DocumentData, query, where, doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { sampleMenuItems, sampleCategories } from "./sample-data";
import { FRANCHISE_CONFIG } from "./config";

// Use franchise ID from config - change this to show different franchise data
const TARGET_FRANCHISE_ID = FRANCHISE_CONFIG.FRANCHISE_ID;

export interface MenuItem {
  id: string;
  allergens: string[];
  categoryId: string;
  createdAt: any;
  description: string;
  franchiseId: string;
  halfPortionCost?: number;
  hasHalfPortion?: boolean;
  imageUrl?: string;
  name: string;
  isVegetarian: boolean;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

export interface Franchise {
  id: string;
  name: string;
  address: string;
  logoUrl?: string;
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    // Query menu items for the specific franchise
    const menuCollection = collection(db, "menuItems");
    const q = query(menuCollection, where("franchiseId", "==", TARGET_FRANCHISE_ID));
    const menuSnapshot = await getDocs(q);
    
    if (menuSnapshot.empty) {
      console.log(`No menu items found for franchise ${TARGET_FRANCHISE_ID}, using sample data`);
      // Filter sample data to match target franchise
      return sampleMenuItems.filter(item => item.franchiseId === TARGET_FRANCHISE_ID);
    }
    
    return menuSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MenuItem));
  } catch (error) {
    console.error(`Error fetching menu items for franchise ${TARGET_FRANCHISE_ID}, using sample data:`, error);
    // Filter sample data to match target franchise
    return sampleMenuItems.filter(item => item.franchiseId === TARGET_FRANCHISE_ID);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    // Get all categories first
    const categoriesCollection = collection(db, "categories");
    const categoriesSnapshot = await getDocs(categoriesCollection);
    
    // Get menu items for this franchise to determine which categories are used
    const menuItems = await fetchMenuItems();
    const usedCategoryIds = [...new Set(menuItems.map(item => item.categoryId))];
    
    if (categoriesSnapshot.empty) {
      console.log("No categories found in Firestore, using sample data");
      // Filter sample categories to only include those used by this franchise
      return sampleCategories.filter(category => usedCategoryIds.includes(category.id));
    }
    
    // Filter categories to only include those used by this franchise
    const allCategories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
    
    return allCategories.filter(category => usedCategoryIds.includes(category.id));
  } catch (error) {
    console.error("Error fetching categories, using sample data:", error);
    // Get menu items to determine which categories are used
    const menuItems = sampleMenuItems.filter(item => item.franchiseId === TARGET_FRANCHISE_ID);
    const usedCategoryIds = [...new Set(menuItems.map(item => item.categoryId))];
    
    // Filter sample categories to only include those used by this franchise
    return sampleCategories.filter(category => usedCategoryIds.includes(category.id));
  }
}

export async function fetchFranchise(): Promise<Franchise | null> {
  try {
    const franchiseCollection = collection(db, "franchises");
    const franchiseSnapshot = await getDocs(franchiseCollection);
    const franchiseDoc = franchiseSnapshot.docs.find(doc => doc.id === TARGET_FRANCHISE_ID);
    
    if (franchiseDoc) {
      return {
        id: franchiseDoc.id,
        ...franchiseDoc.data()
      } as Franchise;
    }
    
    // Return sample franchise if no data found
    return {
      id: TARGET_FRANCHISE_ID,
      name: "Premium Restaurant",
      address: "123 Main Street, City, State 12345",
      logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=200&fit=crop"
    };
  } catch (error) {
    console.error("Error fetching franchise, using sample data:", error);
    return {
      id: TARGET_FRANCHISE_ID,
      name: "Premium Restaurant",
      address: "123 Main Street, City, State 12345",
      logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=200&fit=crop"
    };
  }
}

export async function getPromotionImage(): Promise<string | null> {
  try {
    const promotionsCollection = collection(db, "promotions");
    const promotionsSnapshot = await getDocs(promotionsCollection);
    
    if (promotionsSnapshot.empty) {
      console.log("No promotions found in Firestore");
      return null; // No promotion content to display
    }
    
    // Get the first promotion document
    const firstPromotion = promotionsSnapshot.docs[0];
    const promotionData = firstPromotion.data();
    
    // Check if status is true (promotion should be displayed)
    if (promotionData.status !== true) {
      console.log("Promotion status is not true, not displaying promotion");
      return null; // Promotion is disabled
    }
    
    // Check if images array exists and has at least one item
    if (promotionData.images && Array.isArray(promotionData.images) && promotionData.images.length > 0) {
      return promotionData.images[0]; // Return the first image (0th item)
    }
    
    console.log("No images found in promotion document");
    return null; // No promotion content to display
  } catch (error) {
    console.error("Error fetching promotion image:", error);
    return null; // No promotion content to display
  }
}

export async function getPromotionStatus(): Promise<boolean> {
  try {
    const promotionsCollection = collection(db, "promotions");
    const promotionsSnapshot = await getDocs(promotionsCollection);
    
    if (promotionsSnapshot.empty) {
      return false;
    }
    
    const firstPromotion = promotionsSnapshot.docs[0];
    const promotionData = firstPromotion.data();
    
    return promotionData.status === true;
  } catch (error) {
    console.error("Error fetching promotion status:", error);
    return false;
  }
}

export async function updatePromotionStatus(newStatus: boolean): Promise<void> {
  try {
    const promotionsCollection = collection(db, "promotions");
    const promotionsSnapshot = await getDocs(promotionsCollection);
    
    if (promotionsSnapshot.empty) {
      throw new Error("No promotion document found");
    }
    
    const firstPromotionDoc = promotionsSnapshot.docs[0];
    const promotionDocRef = doc(db, "promotions", firstPromotionDoc.id);
    
    await updateDoc(promotionDocRef, {
      status: newStatus
    });
    
    console.log(`Promotion status updated to: ${newStatus}`);
  } catch (error) {
    console.error("Error updating promotion status:", error);
    throw error;
  }
}

export async function uploadPromotionImage(file: File): Promise<string> {
  try {
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `promotion_${timestamp}_${file.name}`;
    
    // Create storage reference
    const storageRef = ref(storage, `promotions/${filename}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log("Image uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function updatePromotionImage(imageUrl: string): Promise<void> {
  try {
    const promotionsCollection = collection(db, "promotions");
    const promotionsSnapshot = await getDocs(promotionsCollection);
    
    if (promotionsSnapshot.empty) {
      throw new Error("No promotion document found");
    }
    
    const firstPromotionDoc = promotionsSnapshot.docs[0];
    const promotionDocRef = doc(db, "promotions", firstPromotionDoc.id);
    
    // Get current document data
    const currentData = firstPromotionDoc.data();
    
    // Update images array - replace first element or create new array
    let updatedImages: string[];
    if (currentData.images && Array.isArray(currentData.images)) {
      updatedImages = [...currentData.images];
      updatedImages[0] = imageUrl; // Replace first element
    } else {
      updatedImages = [imageUrl]; // Create new array with the image
    }
    
    await updateDoc(promotionDocRef, {
      images: updatedImages
    });
    
    console.log("Promotion image updated successfully");
  } catch (error) {
    console.error("Error updating promotion image:", error);
    throw error;
  }
}