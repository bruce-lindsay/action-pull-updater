const chooseRandomItem = <T>(items: ReadonlyArray<T>): T => items[Math.floor(Math.random() * items.length)];

type ChooseItemErrorType = "zero_items" | "all_items_eliminated";

export class ChooseItemError {
  constructor(public chooseError: ChooseItemErrorType) {}
}

export class FilteredRandomChooser<T> {
  remainingItems: ReadonlyArray<T>;
  initialItemCount: number;
  constructor(items: ReadonlyArray<T>, private test: (item: T) => Promise<boolean> ) {
    this.remainingItems = [...items];
    this.initialItemCount = this.remainingItems.length;
  }

  async Choose(): Promise<T> {
    if (this.initialItemCount == 0) {
      return Promise.reject(new ChooseItemError("zero_items"))
    }

    if (this.remainingItems.length === 0) {
      return Promise.reject(new ChooseItemError("all_items_eliminated"))
    }

    const candidateItem = chooseRandomItem(this.remainingItems);
    try {
      const acceptableItem = await this.test(candidateItem);

      if (acceptableItem) {
        return Promise.resolve(candidateItem);
      } else {
        this.remainingItems = this.remainingItems.filter(item => item !== candidateItem);
      }
    } catch (e) {
      return Promise.reject(e);
    }

    return this.Choose();
  }
}