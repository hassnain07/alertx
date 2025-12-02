import cv2
import numpy as np


def read_image_bytes(image_bytes):
    """
    convert raw bytes -> numpy array (open cv formate)
    """

    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img


