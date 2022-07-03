// JavaScript Document


class Album{
    var pictures = {}
    constructor(pics){
        //pics is the initial SET of pictures, could be empty
        
        //make a dictionary
        const setIter = pics.values();
        for (i=1; i<=pics.size; i++){
            pictures[i]=setIter.next().value;
        }
    }
    //getter
    getPictures(){
        return this.pictures;
    }   

    
    getSize(){
        return this.pictures.size
    }

    
}

var test = Set("a","b","c")

var test_album = new Album(test);

test_album.getPictures()






