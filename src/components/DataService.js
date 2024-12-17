// DataService.js
import { db } from '../config/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

class DataService {
  /**
   * Retrieves a list of topics/documents from a specified category in the 'GatheredDocs' collection.
   * @param {string} category - The category from which to retrieve the topics.
   * @returns {Promise<Array>} - An array of document names/topics.
   */
  static async getTopicsList(category) {
    try {
      const docRef = doc(db, 'GatheredDocs', category);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.documents || [];
      } else {
        return [];
      }
    } catch (error) {
      console.error(
        `Error fetching topics list for category '${category}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves a specific topic/document from a specified category.
   * Adjusted to return only the 'data' field to exclude paragraphs.
   * @param {string} category - The category from which to retrieve the topic.
   * @param {string} topicId - The ID of the topic/document to retrieve.
   * @returns {Promise<Object>} - The data of the requested topic/document.
   */
  static async getTopic(category, topicId) {
    try {
      const docRef = doc(db, category, topicId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        // Return only the 'data' field to exclude paragraphs
        return { data: docData.data };
      } else {
        throw new Error(`No data found for topic: ${topicId} in ${category}`);
      }
    } catch (error) {
      console.error(
        `Error fetching topic '${topicId}' from category '${category}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves paragraphs (Summary and field explanations) for a specific topic.
   * Adjusted to fetch from the correct paragraphs collection based on category.
   * @param {string} category - The category from which to retrieve the paragraphs.
   * @param {string} topicId - The ID of the topic/document to retrieve.
   * @returns {Promise<Object|null>} - An object containing paragraphs or null if not found.
   */
  static async getParagraphs(category, topicId) {
    try {
      let paragraphsCollectionName;
      if (category === 'Countries') {
        paragraphsCollectionName = 'CountryDtPars';
      } else if (category === 'UsStates') {
        paragraphsCollectionName = 'UsStatesDtPars';
      } else {
        paragraphsCollectionName = 'DTCountriesParagraphs'; // Default or adjust accordingly
      }

      const docRef = doc(db, paragraphsCollectionName, topicId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data; // Return the entire data object containing paragraphs
      } else {
        console.log(`No paragraphs available for topic: ${topicId}`);
        return null;
      }
    } catch (error) {
      console.error(
        `Error fetching paragraphs for topic '${topicId}' in category '${category}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves specific data from a specified collection and document ID.
   * @param {string} category - The collection from which to retrieve the data.
   * @param {string} id - The ID of the document to retrieve.
   * @returns {Promise<Object>} - The data of the requested document.
   */
  static async getSpecificData(category, id) {
    try {
      const docRef = doc(db, category, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error(`No data found for id: ${id} in ${category}`);
      }
    } catch (error) {
      console.error(
        `Error fetching data for ID '${id}' from category '${category}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves a list of entities (countries or states) from the specified collection.
   * @param {string} selection - The selection indicating 'EachCountry' or 'EachState'.
   * @returns {Promise<Array>} - An array of entity names.
   */
  static async getEntitiesFromFirebase(selection) {
    try {
      let collectionName;
      if (selection === 'EachState') {
        collectionName = 'EachState'; // Updated collection name for states
      } else if (selection === 'EachCountry') {
        collectionName = 'EachCountry';
      } else {
        collectionName = 'DefaultCollection';
      }
      const querySnapshot = await getDocs(collection(db, collectionName));
      const entities = querySnapshot.docs.map((doc) => doc.id);
      return entities;
    } catch (error) {
      console.error(
        `Error fetching entities from selection '${selection}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves data for a specific entity (country or state).
   * @param {string} selection - The selection indicating 'EachCountry' or 'EachState'.
   * @param {string} entityId - The ID of the entity to retrieve.
   * @returns {Promise<Object>} - The data of the requested entity.
   */
  static async getEntityData(selection, entityId) {
    try {
      let collectionName;
      if (selection === 'EachState') {
        collectionName = 'EachState'; // Updated collection name for states
      } else if (selection === 'EachCountry') {
        collectionName = 'EachCountry';
      } else {
        collectionName = 'DefaultCollection';
      }
      const docRef = doc(db, collectionName, entityId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data };
      } else {
        throw new Error(
          `No data found for entity: ${entityId} in ${collectionName}`,
        );
      }
    } catch (error) {
      console.error(
        `Error fetching entity data for '${entityId}' in selection '${selection}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves paragraphs for a specific country from the 'CountryParagraphs' collection.
   * @param {string} entityId - The name of the country (document ID) to retrieve paragraphs for.
   * @returns {Promise<Object|null>} - The paragraphs object or null if not found.
   */
  static async getCountryParagraphs(entityId) {
    try {
      const docRef = doc(db, 'CountryParagraphs', entityId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log(`No paragraphs available for country: ${entityId}`);
        return null;
      }
    } catch (error) {
      console.error(
        `Error fetching paragraphs for country '${entityId}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves paragraphs for a specific state from the 'EachStateParagraphs' collection.
   * @param {string} entityId - The name of the state (document ID) to retrieve paragraphs for.
   * @returns {Promise<Object|null>} - The paragraphs object or null if not found.
   */
  static async getStateParagraphs(entityId) {
    try {
      const docRef = doc(db, 'EachStateParagraphs', entityId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log(`No paragraphs available for state: ${entityId}`);
        return null;
      }
    } catch (error) {
      console.error(
        `Error fetching paragraphs for state '${entityId}':`,
        error,
      );
      throw error;
    }
  }
}

export default DataService;
