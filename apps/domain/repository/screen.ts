import Screen from "../model/Screen";

interface ScreenRepository {
    find(id: string): Promise<Screen>;
    findByTheater(theaterCode: string): Promise<Array<Screen>>;
    store(screen: Screen): Promise<void>;
}

export default ScreenRepository;