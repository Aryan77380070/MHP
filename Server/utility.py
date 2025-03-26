import pickle
import json
import numpy as np

__locations = None
__data_columns = None
__model = None

def get_estimated_price(Location,Area,New_or_Resale,Gymnasium,Lift_Available,Car_Parking,Gas_Connection,Swimming_Pool,bhk):
    try:
        loc_index = __data_columns.index(Location.lower())
    except:
        loc_index = -1

    x = np.zeros(len(__data_columns))
    x[0] = Area
    x[1] = New_or_Resale
    x[2] = Gymnasium
    x[3] = Lift_Available
    x[4] = Car_Parking
    x[5] = Gas_Connection
    x[6] = Swimming_Pool
    x[7] = bhk
    if loc_index >= 0:
        x[loc_index] = 1

    return round(__model.predict([x])[0],2)


def load_saved_artifacts():
    print("loading saved artifacts...start")
    global  __data_columns
    global __locations

    with open('./Server/locations.json', 'r') as f:
        __data_columns = json.load(f)['data_columns']
        __locations = __data_columns[10:]  # first 9 columns are stuff

    global __model
    if __model is None:
        with open('./Server/realestate_price_model_mumbai.pickle', 'rb') as f:
            __model = pickle.load(f)
    print("loading saved artifacts...done")

    
def get_location_names():
    return __locations

def get_data_columns():
    return __data_columns

if __name__ == '__main__':
     load_saved_artifacts()