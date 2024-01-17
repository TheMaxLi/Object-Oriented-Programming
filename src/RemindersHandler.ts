import Logger from "./util/ReminderLogger";
import Reminder from './Reminder';
import { keyInYNStrict } from "readline-sync";
import FuzzySearch from 'fuzzy-search'

/**
 * A grouping of reminders based on tag (case-insensitive)
 */
export interface RemindersGroupingByTag {
    [tag: string]: Reminder[];
}

/**
 * @class RemindersHandler
 * @description Represents a handler that manages a list of reminders
 */
export default class RemindersHandler {
    private _reminders: Reminder[];

    /**
     * Creates a new RemindersHandler instance with no reminders.
     */
    constructor() {
        this._reminders = [];
    }

    /**
     * Returns the list of reminders added so far.
     */
    public get reminders(): Reminder[] {
        if (!this._reminders) {
            throw new Error("You have no reminders")
        }
        return this._reminders
    }

    /**
     * Creates a new reminder and adds it to list of reminders.
     * @param description - The full description of reminder
     * @param tag - The keyword used to help categorize reminder
     */
    public addReminder(description: string, tag: string): void {
        this._reminders.push(new Reminder(description, tag))
    }

    /**
     * Returns the reminder at specified index.
     * @throws ReminderError if specified index is not valid
     * @param index - The index of the reminder
     */
    public getReminder(index: number): Reminder {
        if (!this.isIndexValid(index)) {
            throw new Error("This index is not valid")
        }
        return this._reminders[index-1]
    }

    /**
     * Returns true if specified index is valid, false otherwise.
     * @param index - The position of the reminder in list of reminders
     */
        public isIndexValid(index: number): boolean {
        if (this.size() === 0) return false;
        if (index < 0 || index + 1 > this.size()) return false;
        return true;
    }

    /**
     * Returns the number of reminders added so far.
     */
    public size(): number {
        return this._reminders.length;
    }

    /**
     * Modifies the description of the reminder at a specified index.
     * Silently ignores call if index is not valid.
     * @param index - The index of the reminder
     * @param description - The full description of reminder
     * @param tag - The keyword used to help categorize reminder
     */
    public modifyReminder(index: number, description: string): void {
        this._reminders[index-1].description = description
    }

    /**
     * Toggle the completion status of the reminder at specified index.
     * Silently ignores call if index is not valid.
     * @param index - The index of the reminder
     */
    public toggleCompletion(index: number): void {
        this._reminders[index-1].toggleCompletion()
    }

    /**
     * Returns a list of reminders that match the keyword
     * All reminders with tags that match the search keyword exactly will be returned first.
     * If none exist, then all reminders with descriptions that match the search keyword (even partially)
     * are returned.
     * @param keyword - Text to search for in description and tag
     */
    public search(keyword: string): Reminder[] {
        let tagResults = this.searchTags(keyword)
        if (tagResults.length === 0) {
            tagResults = this.searchDescriptions(keyword)
        }
        return tagResults
    }

    /**
     * Returns a grouping of the reminders based on tag (case-insensitive).
     */
    public groupByTag(): RemindersGroupingByTag {
        const groupings: RemindersGroupingByTag = {};

        this._reminders.forEach((reminder) => {
            if (reminder.tag in groupings) {
                groupings[reminder.tag].push(reminder)
            } else {
                groupings[reminder.tag] = [reminder]
            }
        })

        return groupings;
    }

    /**
     * Returns a list of reminders with tags that match the keyword exactly.
     * @param keyword - Text to search for in description and tag
     */
    private searchTags(keyword: string): Reminder[] {
        return this._reminders.filter((reminder) => reminder.tag.toLowerCase() === keyword.toLowerCase())
    }

    /** 
     * Returns a list of reminders with descriptions that match the keyword.
     * @param keyword - Text to search for in description and tag
     */
    private searchDescriptions(keyword: string): Reminder[] {
        Logger.log("Could not find based on keyword, now searching based on description")
        const reminderDesc = this.reminders.map((reminder) => reminder.description)
        const haystack = new FuzzySearch(reminderDesc);
        const result = haystack.search(keyword)
        return this._reminders.filter((reminder) => result.includes(reminder.description))
    }
}
