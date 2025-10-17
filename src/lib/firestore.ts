import { collection, getDocs, DocumentData, query, where } from "firebase/firestore";
import { db } from "./firebase";
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