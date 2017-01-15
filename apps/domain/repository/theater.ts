import Theater from "../model/Theater";

interface TheaterRepository {
    findById(id: string): Promise<Theater>;
    store(theater: Theater): Promise<void>;
}

export default TheaterRepository;