package com.dmv.formatters;

import com.dmv.pojo.ServiceCategory;
import java.text.ParseException;
import java.util.Locale;
import org.springframework.format.Formatter;

/**
 *
 * @author Do Minh Vuong
 */
public class CategoryFormatter implements Formatter<ServiceCategory> {
    @Override
    public String print(ServiceCategory cate, Locale locale) {
        return String.valueOf(cate.getId());
    }

    @Override
    public ServiceCategory parse(String cateId, Locale locale) throws ParseException {
        ServiceCategory c = new ServiceCategory();
        c.setId(Integer.valueOf(cateId));
        return c;
    }
}