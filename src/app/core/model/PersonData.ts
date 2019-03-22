export class PersonData {

    age: number;
    name: string;
    persondId: string;

    print() {
        console.log('person data', this.age, this.name, this.persondId);
    }

}
